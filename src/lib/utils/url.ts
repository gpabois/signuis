import { DateBounds } from "@/components/Timeline/model";
import { LatLng } from "leaflet";

function toQueryParamsMap<T extends {[key: string]: any}>(object: T): {[key in keyof T]: string} {
    return Object.fromEntries(
        Object
        .entries(object)
        .map(([name, value]) => [name, serializeValue(value)])) as {[key in keyof T]: string}
}

export function toQueryParams<T extends {[key: string]: any}>(object: T) : string {
   return Object.entries(toQueryParamsMap(object)).map(([name, value]) => `${name}=${value}`).join('&')
}

const isDate = (thing: any): thing is Date => thing instanceof Date;
const isDateBounds = (thing: any): thing is DateBounds => typeof thing == "object" && isDate(thing.from) && isDate(thing.to);
const isLatLng = (thing: any): thing is LatLng => thing instanceof LatLng;
const isNumber = (thing: any): thing is Number => typeof thing === "number";

const serializeValue = (value: any): string => {
    if(isDateBounds(value)) {
        return `${value.from.getTime()}-${value.to.getTime()}`
    } 
    else if(isLatLng(value)) {
        return `${value.lat};${value.lng}`
    }
    else if(Array.isArray(value)) {
        return value.join(",")
    }
    else {
        return `${value}`
    }
}

const deserializeValue = <T>(ser: string, ref: T): T => {
    let value: any = ref;

    if(isDateBounds(ref)) {
        const [from, to] = ser.split('-');
        
        value = {
            from: new Date(Number(from)),
            to: new Date(Number(to)),
        }
    } 
    else if(isLatLng(ref)) {
        const [lat, lon] = ser.split(';')
        value = new LatLng(Number(lat), Number(lon))
    }
    else if(isNumber(ref)) {
        value = Number(ser)
    } 
    else if(Array.isArray(value)) {
        value = ser.split(",")
    }
    else {
        value = ser
    }

    return value as T;
}

export function fromQueryParams<T extends {[key: string]: any}, O extends {[key in keyof T]?: string}>(dest: T, params: O) {
    Object
    .entries(params)
    .filter(([_, ser]) => ser !== undefined && ser !== null)
    .forEach(([attrName, ser]) => {
        const ref = dest[attrName];
        dest[attrName as keyof T] = deserializeValue(ser!, ref);
    })
}
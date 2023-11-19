class RcCell<O=any> {
    private counter: number = 1;
    private destructor: (obj: O) => void;
    private obj: O;

    constructor(obj: O, destructor: (obj: O) => void) {
        this.obj = obj;
        this.destructor = destructor;
    }

    get(): O {return this.obj};
    
    release() {
        this.counter--;

        if(this.counter == 0)
            this.destructor(this.obj);
    }

    acquire() : RcCell<O> {
        this.counter++;
        return this;
    }

    rc(): number {
        return this.counter;
    }
}

export class Rc<O=any> {
    private cell: RcCell<O>;

    static new<O=any>(obj: O, destructor: (obj: O) => void): Rc<O> {
        return new Rc(new RcCell(obj, destructor));
    }   

    constructor(cell: RcCell<O>) {
        this.cell = cell;
    }

    get(): O {return this.cell.get()};
    release() {this.cell.release();}
    copy(): Rc<O> {return new Rc(this.cell.acquire())}

    rc(): number {
        return this.cell.rc();
    }
}

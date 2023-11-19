
type Receiver<Data=any> = (emitter: any, data: Data) => Promise<void>;

/**
 * Signal based event management.
 */
export class Signal<Data=any> {
    receivers: Receiver<Data>[] = [];
    
    /**
     * Connect the signal to a receiver.
     * @param receiver
     * @return the deconnector
     */
    connect(receiver: Receiver<Data>) {
        this.receivers.push(receiver);
        return () => this.receivers = this.receivers.filter((r) => r != receiver);
    }

    /**
     * Remove all receivers.
     */
    clearAll() {
        this.receivers = [];
    }

    /**
     * Send a signal from an emitter
     * @param emitter 
     * @param data 
     */
    async send(emitter: any, data: Data) {
        await Promise.all(this.receivers.map((recv) => recv(emitter, data)))
    }
};
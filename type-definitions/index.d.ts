import { Stream } from "most";

declare interface Thenable<A> {
    then<U>(onFulfilled?: (value: A) => U | Thenable<U>, onRejected?: (error: any) => U | Thenable<U>): Thenable<U>;
    then<U>(onFulfilled?: (value: A) => U | Thenable<U>, onRejected?: (error: any) => void): Thenable<U>;
    catch<U>(onRejected?: (error: any) => U | Thenable<U>): Thenable<U>;
}

declare interface Promise<A> {
  constructor(callback: (resolve: (value?: A | Thenable<A>) => void, reject: (error?: any) => void) => void): Promise<A>;

  then<U>(onFulfilled?: (value: A) => U | Thenable<U>, onRejected?: (error: any) => U | Thenable<U>): Promise<U>;
  then<U>(onFulfilled?: (value: A) => U | Thenable<U>, onRejected?: (error: any) => void): Promise<U>;

  catch<U>(onRejected?: (error: any) => U | Thenable<U>): Promise<U>;
}

declare interface DisposeFn {
  (): void | Promise<any>;
}

export default function create<A>(f: (add: (a: A) => any,
                                      end: (x?: any) => any,
                                      error: (e: Error) => any) => void | DisposeFn ): Stream<A>;

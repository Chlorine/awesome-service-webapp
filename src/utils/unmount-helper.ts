export type WrapRes<T> = {
  err?: Error | null;
  results: T;
};

export class UnmountHelper {
  isMounted: boolean;

  constructor() {
    this.isMounted = false;
  }

  onMount() {
    this.isMounted = true;
  }

  onUnmount() {
    this.isMounted = false;
  }

  setTimeout(handler: Function, timeout: number) {
    window.setTimeout(() => {
      if (this.isMounted) {
        handler();
      } else {
        console.warn(`UnmountHelper: timeout handler cancelled`);
      }
    }, timeout);
  }

  async wrap<T>(promise: Promise<T>) {
    return new Promise<WrapRes<T>>(resolve => {
      promise
        .then(results => {
          if (this.isMounted) {
            resolve({ err: null, results });
          } else {
            console.warn(
              `UnmountHelper.wrap: promise resolved but parent already unmounted`,
            );
          }
        })
        .catch(err => {
          if (this.isMounted) {
            // @ts-ignore
            resolve({ err });
          } else {
            console.warn(
              `UnmountHelper.wrap: promise rejected but parent already unmounted`,
            );
          }
        });
    });
  }

  async wrap2<T>(
    promise: Promise<T>,
  ): Promise<{ stillMounted: boolean; err?: Error; results: T }> {
    try {
      const results = await promise;

      if (!this.isMounted) {
        console.warn(
          `UnmountHelper.wrap: promise resolved but parent already unmounted`,
        );
      }

      return {
        stillMounted: this.isMounted,
        results,
      };
    } catch (err) {
      if (!this.isMounted) {
        console.warn(
          `UnmountHelper.wrap: promise rejected but parent already unmounted`,
        );
      }

      // @ts-ignore
      return {
        stillMounted: this.isMounted,
        err,
      };
    }
  }
}

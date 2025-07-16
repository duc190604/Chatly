export const emitWithPromise = (
  socket: any,
  event: string,
  data: any,
  timeout: number = 3000
): Promise<any> => {
  return new Promise((resolve, reject) => {
    if (!socket?.connected) {
      const wait = setTimeout(() => {
        reject(new Error("Socket not connected within timeout"));
      }, timeout);

      socket.once("connect", () => {
        clearTimeout(wait);
        emit();
      });
    } else {
      emit();
    }

    function emit() {
      const timer = setTimeout(() => {
        reject(new Error(`Socket emit timeout after ${timeout}ms`));
      }, timeout);

      try {
        socket.emit(event, data, (response: any) => {
          clearTimeout(timer);
          resolve(response);
        });
      } catch (error) {
        clearTimeout(timer);
        reject(error);
      }
    }
  });
};

export async function getData (params) {
    return new Promise((res, rej) => {
        setTimeout(() => {
            // res('hello czf, i am here.' + params);
            rej('hello czf, i am here still. ' + params);
        }, 1500)
    });
}

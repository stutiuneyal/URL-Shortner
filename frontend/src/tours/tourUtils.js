export function waitForElement(selector, timeout = 3000) {
    return new Promise((resolve) => {
        const start = Date.now();

        const check = () => {
            const el = document.querySelector(selector);

            if (el) {
                resolve(true);
                return;
            }

            if (Date.now() - start > timeout) {
                resolve(false);
                return;
            }

            requestAnimationFrame(check);
        };

        check();
    });
}
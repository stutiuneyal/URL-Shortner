export const confirm = (modal, opts = {}) =>
    new Promise((resolve) => {
        modal.confirm({
            title: opts.title || 'Confirm',
            content: opts.content || 'Are you sure?',
            okText: 'Yes',
            cancelText: 'No',
            onOk: () => resolve(true),
            onCancel: () => resolve(false),
        });
    });
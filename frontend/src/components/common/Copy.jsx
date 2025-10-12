import { Button, App as AntdApp } from "antd";
import { CopyOutlined } from '@ant-design/icons';

export default function Copy({text,children}){

     const {message } = AntdApp.useApp();

    const copy = async () => {
        await navigator.clipboard.writeText(text);
        message.success('Copied to clipboard');
    }

    return(
        <Button icon={<CopyOutlined />} onClick={copy} size="small" >
            {children || 'Copy'}
        </Button>
    )
}
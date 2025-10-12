import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { ConfigProvider, App as AntdApp } from 'antd'
import { BrowserRouter } from 'react-router-dom'
import 'antd/dist/reset.css';
import './styles/globals.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ConfigProvider theme={{
      token: {
        colorPrimary: '#1677ff',
        borderRadius: 8,
      },
    }}>
      <AntdApp>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </AntdApp>
    </ConfigProvider>
  </StrictMode>,
)

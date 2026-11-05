# AES encrytion and decryption

浏览器端 AES-ECB 工具，支持 UTF-8 明文和密码、128/192/256 位密钥、六种填充以及 Base64/Hex 密文。默认密码为 `Arbitrary_Secret`。

## 本地运行

在项目目录中执行 `python3 -m http.server 8080 --bind 127.0.0.1 --directory dist`，打开 http://127.0.0.1:8080/ 。

## 部署

把 `dist` 目录作为静态站点根目录，首页设为 `index.html`。所有资源均随项目提供，无需构建或运行后端。使用 HTTPS 可启用剪贴板按钮。

## 互操作约定

- AES 分块固定为 16 字节。128、192、256 位对应密钥长度。
- 密码经 UTF-8 编码后在末尾补零至指定密钥长度。超长密码会报错。与其他实现交换密文时，双方须使用相同的密钥字节。
- AES 的 PKCS5Padding 选项采用常见的 16 字节 PKCS7 填充行为。ISO10126 使用随机填充字节，ANSI X9.23 使用零填充字节，两者均以填充长度作为末字节。
- ZeroPadding 解密会去掉尾部零字节，因此会丢失明文末尾的 U+0000。No Padding 要求明文 UTF-8 字节长度是 16 的倍数。

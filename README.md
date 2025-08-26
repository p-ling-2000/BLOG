
![RMtitle](https://github.com/user-attachments/assets/b4f4255c-c6e7-4b14-8763-299357197f23)

---

## 公開URL
https://blog-chi-livid-15.vercel.app/
<br>
※現時点では PC 表示を優先しています。スマホ／タブレットは今後整えていきます

---

## 概要

※このサイトは個人の練習作品として制作・公開しています。

- **実装していること**  
  文章・写真の掲載。  
  連絡フォームの送信内容をメールで受け取れるようにしました（Resend 連携）。  
  左カラムを固定し、右カラムのみ切り替わる構成で、軽く表示されるようにしています。

- **ポイント**  
  押せる場所が分かるよう、リンクやボタンにカーソルを合わせると色が変わる挙動にしています。  
  画面の一部だけを更新するため、遷移感が自然で体感が軽いところを意識しています。

#### 補足：「色々診断」機能について
- 現時点では紹介画面のみで、ロジック／結果の実装は未着手です。  
- 以後は独立モジュール化を想定（別の場所で流用しやすくする方針）。  
- 任意機能のため、不要になれば外せる設計にしています。

---

## 制作の背景

SNS や Medium の発信を、自分らしいデザインでひとつにまとめたくて作りました。  
機能は必要最小限に絞り、軽さと操作性を優先。学びながら少しずつ拡張していく前提の作品です。

---

## 画面と機能

- **ナビゲーション**：使用中の項目が配色で分かるようにしています（色は調整可能）。  
- **左カラム固定**：プロフィールや共通導線など、常に見せたい情報を配置。  
- **右カラムの動的切替**：JavaScript で右側のみ差し替える構成にしました。  
- **連絡フォーム**：Resend と連携し、送信内容をメールで受信できるようにしています。  
- **ホスティング**：Vercel にデプロイし、SSL で公開しています。


https://github.com/user-attachments/assets/c84f49b5-1fa2-44ac-9a2b-ae53cff3dec9



---

## 使用技術

| Category | Technology Stack / Version |
|---|---|
| Frontend | HTML / CSS / JavaScript |
| Routing | Hash Router |
| Form / API | Fetch API, Resend |
| Backend | Vercel Serverless Functions |
| Infrastructure | Vercel |
| Database | なし |
| Environment setup | Windows 10/11, PowerShell 5, Git 2.51, Node.js 22.18, Vercel CLI 46.0.2 |
| CI/CD | Vercel × GitHub 連携 |
| Lint / Format | ESLint 9.33.0, Prettier 3.6.2 |
| Design | 自作CSS |
| etc. | GitHub（Issues / Pull Request） |

---

## 今後の展望

- **フェーズ 1**  
  文章と写真の公開。トップの誘導バナーを整えて、回遊を強化。

- **フェーズ 2**  
  モバイルファーストで再設計（目安：480 / 768 / 960 / 1200px）。  

- **フェーズ 3**  
  診断機能の開発（進行中）。必要に応じて導入／非導入を判断し、将来的には独立モジュールとして再利用できる構成を目指す。

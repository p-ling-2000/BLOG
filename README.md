
![RMtitle](https://github.com/user-attachments/assets/3d28486b-9c12-465b-9c0c-98399644af25)

---

## サービスのURL

公開中：  
https://blog-chi-livid-15.vercel.app/

---

## サービスの概要

- **できること**  
  文章・写真の公開。  
  連絡フォームからの問い合わせをメールで受信。  
  左カラムを固定し、右カラムのみ切り替え（軽快な表示）。

- **対象**  
  学習記録や日々の発信を手早く始めたい方。  
  迷わない導線と、読みやすい画面を求める方。

- **価値**  
  ホバー時の色変化で「押せる場所」を明確化。  
  問い合わせはメールに自動通知。見落としを抑制。  
  レイアウトの一部のみ更新するため、体感が軽い。

#### 補足：診断機能について
- 現在は紹介画面のみです（ロジック／結果は未実装）。  
- 以後は独立モジュール化を想定。別プロジェクトでも利用可能。  
- 任意機能のため、不要であれば外して運用できます。

---

## サービスへの想い

SNSや Medium の発信を、自分らしいデザインでひとつにまとめたい。  
必要最小限の機能に絞り、軽さと操作性を優先しました。  
学習を続けながら段階的に拡張し、長く使える個人サイトを目指します。

---

## 画面や機能の説明

- **ナビゲーション**：使用中の項目を配色で明示（色は調整可能）。  
- **左カラム固定**：プロフィールや共通導線など、常に表示したい情報を配置。  
- **右カラムの動的切替**：JavaScript で右側のみ差し替え。表示が速い。  
- **連絡フォーム**：Resend と連携し、送信内容をメールで受信。通知を見逃しにくい。  
- **ホスティング**：Vercel にデプロイ。SSL 付きで公開。独自ドメインは任意。

---

## 使用技術

| Category | Technology Stack / Version |
|---|---|
| Frontend | HTML5 / CSS3 / JavaScript |
| Routing | Hash Router |
| Form / API | Fetch API, Resend |
| Backend | Vercel Serverless Functions |
| Infrastructure | Vercel|
| Database | なし |
| Environment setup | Windows 10/11, PowerShell 5, Git 2.51, Node.js 22.18, Vercel CLI 46.0.2 |
| CI/CD | Vercel × GitHub 連携 |
| Lint / Format | ESLint 9.33.0, Prettier 3.6.2 |
| Design | 自作CSS |
| etc. | GitHub（Issues / Pull Request） |

---

## 今後の展望

- **フェーズ 1**  
  文章と写真の公開。トップの誘導バナーを整備し、回遊性を強化。

- **フェーズ 2**
  モバイルファーストで再設計（目安：480 / 768 / 960 / 1200px）
  
- **フェーズ 3**   
  診断機能の実装。必要性に応じて導入／非導入を判断。  
  将来的には独立モジュールとして再利用可能に。

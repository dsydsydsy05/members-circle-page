# Lovable 后端接续提示词

请先同步本项目 GitHub main 最新代码，阅读 `docs/COMMUNITY_UPDATE.md`。本次前端和后端迁移代码已经写好，请在现有项目中完成真实后端部署和联调，不要重新设计页面，不要替换 Supabase 项目，不要重写 Git 历史。

当前连接的 Supabase 项目 ID 是 `yortabtwbntfsggsnoix`。2026-09-28 实测：登录、会员目录和旧后台可用；问答缺少 `qa_answers.guest_id`；`room_connections`、`room_qa_admin`、`room_moderation_admin` 不存在。页面能打开不代表功能可用。

1. 先核对真实数据库结构、备份/恢复能力和迁移记录。只执行尚未应用的三份新增迁移，按顺序逐份事务验收：
   - `supabase/migrations/20260928090000_room_stories.sql`
   - `supabase/migrations/20260928091000_room_community.sql`
   - `supabase/migrations/20260928092000_event_schedule.sql`
   仓库含历史重复迁移，不要盲目重放全部文件或清空数据。若线上结构与代码假设不符，保留现有数据并补兼容迁移，报告具体差异。
2. 部署 `supabase/functions/community-notify` 和更新后的 `supabase/functions/submit-question`。核验鉴权及所需环境变量。复用现有 Resend，配置 `RESEND_API_KEY`、`PUBLIC_SITE_URL=https://theroomcommunity.org`、已验证域名的 `COMMUNITY_FROM_EMAIL`（或现有 `WAITLIST_FROM_EMAIL`）。密钥只放服务端 secrets。缺少权限或发信域名时准确列出阻塞，不假报完成。
3. 保留已经确认的活动页面模板。数据库中 Boston 为 Past Event 02，September 18, 2026，19 founders，海报 `/images/events/boston-founder-dinner-cover-19.png`，现场图 `/images/events/boston-founder-dinner-photo.jpg`；正文保留 Briar Group / Glass House 致谢。Shanghai 保持 Past Event 01。Coming Soon 保留三个，依次 Oct 15、Nov 15、Dec 15。无 Original Invitation 文案，无绿色 hover 边框，两张封面等大。若 Boston 已存在，核对并修正字段，不重复插入。`src/lib/pending-event-preview.ts` 只是开发模式预览，生产必须读取真实数据库。
4. 核验问答：公众可读、登录后对公众匿名提问；身份不进入公开响应。嘉宾回答必须经过草稿→专属链接确认具体版本→管理员发布；过期、撤销、拒绝和修改后的旧授权均不能发布。旧嘉宾回答无授权记录必须待确认。嘉宾资料、举报和后台处理应可用。不要向真实嘉宾自动发送授权邀请。
5. 核验 Connect：正式会员填写原因和明确同意后请求；缺少联系邮箱时引导填写，不默认采用登录邮箱。验证收到/发出/已连接/屏蔽分类、待处理计数、接受、婉拒30天间隔、撤回、断开、屏蔽、举报、自我请求和重复请求拦截。邮箱必须在数据库和接口层限制为本人或有效连接双方可见，不能仅隐藏按钮。邮件失败不能丢失请求，后台可查看并重试。
6. 运行已有类型检查、构建和关键测试，并在真实后端用两个明确指定的测试会员验证完整流程和越权访问。仅向指定测试地址发送测试邮件，不向真实成员发送测试连接或邀请；测试账号/地址不足时明确说明待验收项。核验新资料字段可保存、旧资料无损。修复联调发现的问题，但不要扩大设计范围；第三项趣味设计目前未完成，不要宣称此次已完成。
7. 完成后发布现有 Lovable 网站并检查正式域名。逐项提供：已应用迁移、已部署函数、邮件配置与实际送达结果、双账号与权限测试结果、正式页面地址、仍未完成事项。把本地测试、真实后端验证和正式发布分开报告，不要只用 Git 同步或构建成功作为上线证明。

# 国际化（i18n）键命名规范

三端（Web / App / 后端文案）共享统一的语言列表与键命名约定。

## 支持语言（locale）

| locale | 语言 | 默认回退 |
|---|---|---|
| `en` | English | ✅ 默认回退语言 |
| `zh-CN` | 简体中文 | |
| `zh-TW` | 繁體中文 | |
| `ja` | 日本語 | |
| `ko` | 한국어 | |

- 缺失翻译一律回退到 `en`。
- 首次进入按设备/浏览器语言探测最接近的支持语言；用户选择需持久化。
- `zh-CN` 与 `zh-TW` 必须区分简繁，AI 生成内容亦需遵守。

## 键命名约定

- 采用点分层级：`<scope>.<feature>.<element>`，全小写 kebab/camel 混用以 camel 为主。
- scope 建议：`common`、`auth`、`fridge`、`recipe`、`poster`、`lab`、`wall`、`admin`、`onboarding`、`example`。

示例：

```
common.appName            = "Home Bartender AI"
common.action.save        = "保存"
auth.login.title          = "登录"
fridge.category.baseSpirit = "基酒"
recipe.result.alcoholHint = "请适量饮用，未成年人禁止饮酒"
poster.style.cyberpunk    = "酒吧商业宣传海报"
onboarding.step.selectIngredients = "勾选你冰箱里有的材料"
example.card.title        = "试试这些示例"
```

## 资源文件位置

- Web：`web/src/locales/<locale>.json`（vue-i18n）
- App：`app/lib/l10n/app_<locale>.arb`（Flutter intl）
- 后端：locale 作为请求参数透传给 AI 编排；后端自身面向用户的少量文案放 `backend/src/i18n/<locale>.json`

## 完整性校验

CI 中校验：以 `en` 为基准键集，其余语言不得缺键、不得残留 `__MISSING__` 占位符。

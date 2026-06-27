// ignore: unused_import
import 'package:intl/intl.dart' as intl;
import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for Chinese (`zh`).
class AppLocalizationsZh extends AppLocalizations {
  AppLocalizationsZh([String locale = 'zh']) : super(locale);

  @override
  String get commonAppName => 'AI 调酒师';

  @override
  String get commonActionSave => '保存';

  @override
  String get commonActionShare => '分享';

  @override
  String get commonActionCancel => '取消';

  @override
  String get commonActionConfirm => '确认';

  @override
  String get commonActionRetry => '重试';

  @override
  String get commonActionNext => '下一步';

  @override
  String get commonActionSkip => '跳过';

  @override
  String get commonActionDone => '完成';

  @override
  String get commonActionDelete => '删除';

  @override
  String get commonActionEdit => '编辑';

  @override
  String get commonActionBack => '返回';

  @override
  String get commonLoading => '加载中…';

  @override
  String get commonError => '出错了';

  @override
  String get commonLanguage => '语言';

  @override
  String get commonSettings => '设置';

  @override
  String get authLoginTitle => '登录';

  @override
  String get authRegisterTitle => '注册账号';

  @override
  String get authAccountLabel => '邮箱或手机号';

  @override
  String get authPasswordLabel => '密码';

  @override
  String get authDisplayNameLabel => '昵称';

  @override
  String get authLoginButton => '登录';

  @override
  String get authRegisterButton => '注册';

  @override
  String get authToRegister => '没有账号？去注册';

  @override
  String get authToLogin => '已有账号？去登录';

  @override
  String get authPasswordTooShort => '密码至少 8 位';

  @override
  String get authAccountRequired => '请输入账号';

  @override
  String get authInvalidCredentials => '账号或密码错误';

  @override
  String get authAccountExists => '账号已存在';

  @override
  String get authLogout => '退出登录';

  @override
  String get authPrivacyGaid =>
      '我们使用设备的广告标识符（GAID）为你自动登录。你可以在「系统设置 → 隐私 → 广告」中随时重置该标识。';

  @override
  String get authSigningIn => '正在登录…';

  @override
  String get navFridge => '翻冰箱';

  @override
  String get navWall => '海报墙';

  @override
  String get navLab => '实验室';

  @override
  String get navProfile => '我的';

  @override
  String get fridgeTitle => '翻冰箱';

  @override
  String get fridgeSubtitle => '勾选你冰箱里有的材料';

  @override
  String get fridgeCategoryBaseSpirit => '基酒';

  @override
  String get fridgeCategoryDrink => '饮料';

  @override
  String get fridgeCategoryFruit => '水果';

  @override
  String get fridgeCategorySnack => '零食';

  @override
  String fridgeSelectedCount(int count) {
    return '已选 $count 项';
  }

  @override
  String get fridgeGenerate => '生成配方';

  @override
  String get fridgeNeedMore => '至少勾选 2 种材料才能调出可饮用的配方';

  @override
  String get fridgeClear => '清空';

  @override
  String get exampleCardTitle => '试试这些示例';

  @override
  String get exampleCardSubtitle => '点击查看完整示例配方';

  @override
  String get onboardingTitle => '欢迎';

  @override
  String get onboardingStepSelectIngredients => '勾选你冰箱里有的材料';

  @override
  String get onboardingStepGenerateRecipe => 'AI 为你调一杯专属配方';

  @override
  String get onboardingStepGeneratePoster => '生成海报矩阵，一键分享';

  @override
  String get onboardingStepCheckIn => '在实验室为作品打卡';

  @override
  String get onboardingReplay => '查看引导';

  @override
  String get recipeResultTitle => '你的配方';

  @override
  String recipeAlcoholRange(String range) {
    return '酒精浓度：$range';
  }

  @override
  String get recipeIngredients => '所用材料';

  @override
  String get recipeSteps => '制作步骤';

  @override
  String get recipeToolSubstitutions => '居家平替工具';

  @override
  String get recipeSafetyNotes => '安全提示';

  @override
  String get recipeResultAlcoholHint => '请适量饮用，未成年人禁止饮酒';

  @override
  String get recipeOptional => '可选';

  @override
  String get recipeGuideTitle => '保姆级指南';

  @override
  String get recipeMakePoster => '生成海报';

  @override
  String get recipeGenerating => '正在为你调配…';

  @override
  String get posterTitle => '海报矩阵';

  @override
  String get posterDimensionHomeCloseup => '居家微酿特写';

  @override
  String get posterDimensionBarCommercial => '酒吧商业海报';

  @override
  String get posterDimensionStepsLong => '步骤拆解长图';

  @override
  String get posterStatusPending => '等待中';

  @override
  String get posterStatusRunning => '生成中';

  @override
  String get posterStatusDone => '已完成';

  @override
  String get posterStatusFailed => '失败';

  @override
  String get posterSaveToGallery => '保存到相册';

  @override
  String get posterSaveAll => '全部保存';

  @override
  String get posterSaved => '已保存到相册';

  @override
  String get posterGenerating => '正在生成海报…';

  @override
  String get posterTimeout => '生成超时，请重试';

  @override
  String get labTitle => '我的微醺实验室';

  @override
  String get labEmpty => '还没有打卡，调一杯来打卡吧！';

  @override
  String get labCheckIn => '打卡';

  @override
  String get labResultSuccess => '成功';

  @override
  String get labResultFail => '翻车';

  @override
  String get labPickImage => '选择照片';

  @override
  String get labTakePhoto => '拍照';

  @override
  String get labNoteLabel => '备注';

  @override
  String get labImageRequired => '请添加一张照片';

  @override
  String get labResultRequired => '请标记成功或翻车';

  @override
  String get labSubmitToWall => '投稿到海报墙';

  @override
  String get labSubmittedPending => '已投稿，等待审核';

  @override
  String get labDetailTitle => '作品详情';

  @override
  String labCreatedAt(String date) {
    return '创建于 $date';
  }

  @override
  String get wallTitle => '创意海报墙';

  @override
  String get wallSortHot => 'Hot';

  @override
  String get wallSortTime => '最新';

  @override
  String get wallEmpty => '暂无已通过的海报';

  @override
  String get moderationPrivate => '私有';

  @override
  String get moderationPending => '待审核';

  @override
  String get moderationApproved => '已通过';

  @override
  String get moderationRejected => '已拒绝';

  @override
  String get splashTagline => '调酒，从此随手可得';

  @override
  String get onboardingStep1Title => '扫描你的冰箱';

  @override
  String get onboardingStep1Desc => '拍照或勾选你有的材料，AI 立刻为你调制专属配方。';

  @override
  String get onboardingStep2Title => 'AI 调酒';

  @override
  String get onboardingStep2Desc => '根据你的材料和口味，发现独一无二的配方。';

  @override
  String get onboardingStep3Title => '赛博海报';

  @override
  String get onboardingStep3Desc => '一键为你的作品生成精美、可分享的社交媒体海报。';

  @override
  String get onboardingStep4Title => '社区墙';

  @override
  String get onboardingStep4Desc => '加入全球家庭调酒师社区，分享作品、登顶排行榜。';

  @override
  String get onboardingStartButton => '开始调制';

  @override
  String get homeTitle => '我的作品';

  @override
  String get homeEmpty => '还没有作品，点「制作」开始吧';

  @override
  String get craftMake => '制作';

  @override
  String get craftTemplatesTitle => '制作同款';

  @override
  String get craftDiyTitle => '自选材料';

  @override
  String get craftAddIngredient => '添加材料';

  @override
  String get craftAddIngredientHint => '材料名称';

  @override
  String get craftShareTemplate => '分享模板';

  @override
  String get craftGeneratePoster => '生成分享图';

  @override
  String get craftConfirmTitle => '确认保存';

  @override
  String get craftAddPhotos => '添加成品照';

  @override
  String get craftPhotosOptional => '可选，最多 3 张';

  @override
  String get craftSave => '保存作品';

  @override
  String get craftSaved => '已保存到我的作品';

  @override
  String get craftAiGenerated => 'AI 大师作品已生成';

  @override
  String get profileUserId => '用户 ID';

  @override
  String get profileContactUs => '联系我们';

  @override
  String get profilePrivacy => '隐私协议';

  @override
  String get profileTerms => '用户协议';

  @override
  String get profileCopied => '已复制';

  @override
  String get craftScannerTitle => '冰箱扫描';

  @override
  String get craftScanHint => '对准冰箱或吧台，点击开始扫描';

  @override
  String get craftScanCta => '扫描材料';

  @override
  String get craftScanning => '扫描中…';

  @override
  String craftScanDetected(int count) {
    return '识别到 $count 种材料';
  }

  @override
  String get craftSaveInventory => '保存当前库存';

  @override
  String get craftRescan => '重新扫描';

  @override
  String get craftScanContinue => '继续';

  @override
  String get craftManualSelect => '直接选材料';

  @override
  String get craftInventorySaved => '库存已保存';

  @override
  String get craftRecentScans => '最近扫描';

  @override
  String get homeFeatured => '精选';

  @override
  String get homeHeroCta => '今夜，调一杯属于你的鸡尾酒';

  @override
  String get featuredViewAll => '全部';
}

/// The translations for Chinese, as used in China (`zh_CN`).
class AppLocalizationsZhCn extends AppLocalizationsZh {
  AppLocalizationsZhCn() : super('zh_CN');

  @override
  String get commonAppName => 'AI 调酒师';

  @override
  String get commonActionSave => '保存';

  @override
  String get commonActionShare => '分享';

  @override
  String get commonActionCancel => '取消';

  @override
  String get commonActionConfirm => '确认';

  @override
  String get commonActionRetry => '重试';

  @override
  String get commonActionNext => '下一步';

  @override
  String get commonActionSkip => '跳过';

  @override
  String get commonActionDone => '完成';

  @override
  String get commonActionDelete => '删除';

  @override
  String get commonActionEdit => '编辑';

  @override
  String get commonActionBack => '返回';

  @override
  String get commonLoading => '加载中…';

  @override
  String get commonError => '出错了';

  @override
  String get commonLanguage => '语言';

  @override
  String get commonSettings => '设置';

  @override
  String get authLoginTitle => '登录';

  @override
  String get authRegisterTitle => '注册账号';

  @override
  String get authAccountLabel => '邮箱或手机号';

  @override
  String get authPasswordLabel => '密码';

  @override
  String get authDisplayNameLabel => '昵称';

  @override
  String get authLoginButton => '登录';

  @override
  String get authRegisterButton => '注册';

  @override
  String get authToRegister => '没有账号？去注册';

  @override
  String get authToLogin => '已有账号？去登录';

  @override
  String get authPasswordTooShort => '密码至少 8 位';

  @override
  String get authAccountRequired => '请输入账号';

  @override
  String get authInvalidCredentials => '账号或密码错误';

  @override
  String get authAccountExists => '账号已存在';

  @override
  String get authLogout => '退出登录';

  @override
  String get authPrivacyGaid =>
      '我们使用设备的广告标识符（GAID）为你自动登录。你可以在「系统设置 → 隐私 → 广告」中随时重置该标识。';

  @override
  String get authSigningIn => '正在登录…';

  @override
  String get navFridge => '翻冰箱';

  @override
  String get navWall => '海报墙';

  @override
  String get navLab => '实验室';

  @override
  String get navProfile => '我的';

  @override
  String get fridgeTitle => '翻冰箱';

  @override
  String get fridgeSubtitle => '勾选你冰箱里有的材料';

  @override
  String get fridgeCategoryBaseSpirit => '基酒';

  @override
  String get fridgeCategoryDrink => '饮料';

  @override
  String get fridgeCategoryFruit => '水果';

  @override
  String get fridgeCategorySnack => '零食';

  @override
  String fridgeSelectedCount(int count) {
    return '已选 $count 项';
  }

  @override
  String get fridgeGenerate => '生成配方';

  @override
  String get fridgeNeedMore => '至少勾选 2 种材料才能调出可饮用的配方';

  @override
  String get fridgeClear => '清空';

  @override
  String get exampleCardTitle => '试试这些示例';

  @override
  String get exampleCardSubtitle => '点击查看完整示例配方';

  @override
  String get onboardingTitle => '欢迎';

  @override
  String get onboardingStepSelectIngredients => '勾选你冰箱里有的材料';

  @override
  String get onboardingStepGenerateRecipe => 'AI 为你调一杯专属配方';

  @override
  String get onboardingStepGeneratePoster => '生成海报矩阵，一键分享';

  @override
  String get onboardingStepCheckIn => '在实验室为作品打卡';

  @override
  String get onboardingReplay => '查看引导';

  @override
  String get recipeResultTitle => '你的配方';

  @override
  String recipeAlcoholRange(String range) {
    return '酒精浓度：$range';
  }

  @override
  String get recipeIngredients => '所用材料';

  @override
  String get recipeSteps => '制作步骤';

  @override
  String get recipeToolSubstitutions => '居家平替工具';

  @override
  String get recipeSafetyNotes => '安全提示';

  @override
  String get recipeResultAlcoholHint => '请适量饮用，未成年人禁止饮酒';

  @override
  String get recipeOptional => '可选';

  @override
  String get recipeGuideTitle => '保姆级指南';

  @override
  String get recipeMakePoster => '生成海报';

  @override
  String get recipeGenerating => '正在为你调配…';

  @override
  String get posterTitle => '海报矩阵';

  @override
  String get posterDimensionHomeCloseup => '居家微酿特写';

  @override
  String get posterDimensionBarCommercial => '酒吧商业海报';

  @override
  String get posterDimensionStepsLong => '步骤拆解长图';

  @override
  String get posterStatusPending => '等待中';

  @override
  String get posterStatusRunning => '生成中';

  @override
  String get posterStatusDone => '已完成';

  @override
  String get posterStatusFailed => '失败';

  @override
  String get posterSaveToGallery => '保存到相册';

  @override
  String get posterSaveAll => '全部保存';

  @override
  String get posterSaved => '已保存到相册';

  @override
  String get posterGenerating => '正在生成海报…';

  @override
  String get posterTimeout => '生成超时，请重试';

  @override
  String get labTitle => '我的微醺实验室';

  @override
  String get labEmpty => '还没有打卡，调一杯来打卡吧！';

  @override
  String get labCheckIn => '打卡';

  @override
  String get labResultSuccess => '成功';

  @override
  String get labResultFail => '翻车';

  @override
  String get labPickImage => '选择照片';

  @override
  String get labTakePhoto => '拍照';

  @override
  String get labNoteLabel => '备注';

  @override
  String get labImageRequired => '请添加一张照片';

  @override
  String get labResultRequired => '请标记成功或翻车';

  @override
  String get labSubmitToWall => '投稿到海报墙';

  @override
  String get labSubmittedPending => '已投稿，等待审核';

  @override
  String get labDetailTitle => '作品详情';

  @override
  String labCreatedAt(String date) {
    return '创建于 $date';
  }

  @override
  String get wallTitle => '创意海报墙';

  @override
  String get wallSortHot => '热度';

  @override
  String get wallSortTime => '最新';

  @override
  String get wallEmpty => '暂无已通过的海报';

  @override
  String get moderationPrivate => '私有';

  @override
  String get moderationPending => '待审核';

  @override
  String get moderationApproved => '已通过';

  @override
  String get moderationRejected => '已拒绝';

  @override
  String get splashTagline => '调酒，从此随手可得';

  @override
  String get onboardingStep1Title => '扫描你的冰箱';

  @override
  String get onboardingStep1Desc => '拍照或勾选你有的材料，AI 立刻为你调制专属配方。';

  @override
  String get onboardingStep2Title => 'AI 调酒';

  @override
  String get onboardingStep2Desc => '根据你的材料和口味，发现独一无二的配方。';

  @override
  String get onboardingStep3Title => '赛博海报';

  @override
  String get onboardingStep3Desc => '一键为你的作品生成精美、可分享的社交媒体海报。';

  @override
  String get onboardingStep4Title => '社区墙';

  @override
  String get onboardingStep4Desc => '加入全球家庭调酒师社区，分享作品、登顶排行榜。';

  @override
  String get onboardingStartButton => '开始调制';

  @override
  String get homeTitle => '我的作品';

  @override
  String get homeEmpty => '还没有作品，点「制作」开始吧';

  @override
  String get craftMake => '制作';

  @override
  String get craftTemplatesTitle => '制作同款';

  @override
  String get craftDiyTitle => '自选材料';

  @override
  String get craftAddIngredient => '添加材料';

  @override
  String get craftAddIngredientHint => '材料名称';

  @override
  String get craftShareTemplate => '分享模板';

  @override
  String get craftGeneratePoster => '生成分享图';

  @override
  String get craftConfirmTitle => '确认保存';

  @override
  String get craftAddPhotos => '添加成品照';

  @override
  String get craftPhotosOptional => '可选，最多 3 张';

  @override
  String get craftSave => '保存作品';

  @override
  String get craftSaved => '已保存到我的作品';

  @override
  String get craftAiGenerated => 'AI 大师作品已生成';

  @override
  String get profileUserId => '用户 ID';

  @override
  String get profileContactUs => '联系我们';

  @override
  String get profilePrivacy => '隐私协议';

  @override
  String get profileTerms => '用户协议';

  @override
  String get profileCopied => '已复制';

  @override
  String get craftScannerTitle => '冰箱扫描';

  @override
  String get craftScanHint => '对准冰箱或吧台，点击开始扫描';

  @override
  String get craftScanCta => '扫描材料';

  @override
  String get craftScanning => '扫描中…';

  @override
  String craftScanDetected(int count) {
    return '识别到 $count 种材料';
  }

  @override
  String get craftSaveInventory => '保存当前库存';

  @override
  String get craftRescan => '重新扫描';

  @override
  String get craftScanContinue => '继续';

  @override
  String get craftManualSelect => '直接选材料';

  @override
  String get craftInventorySaved => '库存已保存';

  @override
  String get craftRecentScans => '最近扫描';

  @override
  String get homeFeatured => '精选';

  @override
  String get homeHeroCta => '今夜，调一杯属于你的鸡尾酒';

  @override
  String get featuredViewAll => '全部';
}

/// The translations for Chinese, as used in Taiwan (`zh_TW`).
class AppLocalizationsZhTw extends AppLocalizationsZh {
  AppLocalizationsZhTw() : super('zh_TW');

  @override
  String get commonAppName => 'AI 調酒師';

  @override
  String get commonActionSave => '儲存';

  @override
  String get commonActionShare => '分享';

  @override
  String get commonActionCancel => '取消';

  @override
  String get commonActionConfirm => '確認';

  @override
  String get commonActionRetry => '重試';

  @override
  String get commonActionNext => '下一步';

  @override
  String get commonActionSkip => '跳過';

  @override
  String get commonActionDone => '完成';

  @override
  String get commonActionDelete => '刪除';

  @override
  String get commonActionEdit => '編輯';

  @override
  String get commonActionBack => '返回';

  @override
  String get commonLoading => '載入中…';

  @override
  String get commonError => '發生錯誤';

  @override
  String get commonLanguage => '語言';

  @override
  String get commonSettings => '設定';

  @override
  String get authLoginTitle => '登入';

  @override
  String get authRegisterTitle => '註冊帳號';

  @override
  String get authAccountLabel => '電子郵件或手機號碼';

  @override
  String get authPasswordLabel => '密碼';

  @override
  String get authDisplayNameLabel => '暱稱';

  @override
  String get authLoginButton => '登入';

  @override
  String get authRegisterButton => '註冊';

  @override
  String get authToRegister => '還沒有帳號？前往註冊';

  @override
  String get authToLogin => '已有帳號？前往登入';

  @override
  String get authPasswordTooShort => '密碼至少 8 碼';

  @override
  String get authAccountRequired => '請輸入帳號';

  @override
  String get authInvalidCredentials => '帳號或密碼錯誤';

  @override
  String get authAccountExists => '帳號已存在';

  @override
  String get authLogout => '登出';

  @override
  String get authPrivacyGaid =>
      '我們使用裝置的廣告識別碼（GAID）為您自動登入。您可以在「系統設定 → 隱私 → 廣告」中隨時重置該識別碼。';

  @override
  String get authSigningIn => '登入中…';

  @override
  String get navFridge => '翻冰箱';

  @override
  String get navWall => '海報牆';

  @override
  String get navLab => '實驗室';

  @override
  String get navProfile => '我的';

  @override
  String get fridgeTitle => '翻冰箱';

  @override
  String get fridgeSubtitle => '勾選你冰箱裡有的材料';

  @override
  String get fridgeCategoryBaseSpirit => '基酒';

  @override
  String get fridgeCategoryDrink => '飲料';

  @override
  String get fridgeCategoryFruit => '水果';

  @override
  String get fridgeCategorySnack => '零食';

  @override
  String fridgeSelectedCount(int count) {
    return '已選 $count 項';
  }

  @override
  String get fridgeGenerate => '產生配方';

  @override
  String get fridgeNeedMore => '至少勾選 2 種材料才能調出可飲用的配方';

  @override
  String get fridgeClear => '清空';

  @override
  String get exampleCardTitle => '試試這些範例';

  @override
  String get exampleCardSubtitle => '點擊查看完整範例配方';

  @override
  String get onboardingTitle => '歡迎';

  @override
  String get onboardingStepSelectIngredients => '勾選你冰箱裡有的材料';

  @override
  String get onboardingStepGenerateRecipe => 'AI 為你調一杯專屬配方';

  @override
  String get onboardingStepGeneratePoster => '產生海報矩陣，一鍵分享';

  @override
  String get onboardingStepCheckIn => '在實驗室為作品打卡';

  @override
  String get onboardingReplay => '查看引導';

  @override
  String get recipeResultTitle => '你的配方';

  @override
  String recipeAlcoholRange(String range) {
    return '酒精濃度：$range';
  }

  @override
  String get recipeIngredients => '所用材料';

  @override
  String get recipeSteps => '製作步驟';

  @override
  String get recipeToolSubstitutions => '居家替代工具';

  @override
  String get recipeSafetyNotes => '安全提示';

  @override
  String get recipeResultAlcoholHint => '請適量飲用，未成年人禁止飲酒';

  @override
  String get recipeOptional => '可選';

  @override
  String get recipeGuideTitle => '保姆級指南';

  @override
  String get recipeMakePoster => '產生海報';

  @override
  String get recipeGenerating => '正在為你調配…';

  @override
  String get posterTitle => '海報矩陣';

  @override
  String get posterDimensionHomeCloseup => '居家微釀特寫';

  @override
  String get posterDimensionBarCommercial => '酒吧商業海報';

  @override
  String get posterDimensionStepsLong => '步驟拆解長圖';

  @override
  String get posterStatusPending => '等待中';

  @override
  String get posterStatusRunning => '產生中';

  @override
  String get posterStatusDone => '已完成';

  @override
  String get posterStatusFailed => '失敗';

  @override
  String get posterSaveToGallery => '儲存到相簿';

  @override
  String get posterSaveAll => '全部儲存';

  @override
  String get posterSaved => '已儲存到相簿';

  @override
  String get posterGenerating => '正在產生海報…';

  @override
  String get posterTimeout => '產生逾時，請重試';

  @override
  String get labTitle => '我的微醺實驗室';

  @override
  String get labEmpty => '還沒有打卡，調一杯來打卡吧！';

  @override
  String get labCheckIn => '打卡';

  @override
  String get labResultSuccess => '成功';

  @override
  String get labResultFail => '翻車';

  @override
  String get labPickImage => '選擇照片';

  @override
  String get labTakePhoto => '拍照';

  @override
  String get labNoteLabel => '備註';

  @override
  String get labImageRequired => '請新增一張照片';

  @override
  String get labResultRequired => '請標記成功或翻車';

  @override
  String get labSubmitToWall => '投稿到海報牆';

  @override
  String get labSubmittedPending => '已投稿，等待審核';

  @override
  String get labDetailTitle => '作品詳情';

  @override
  String labCreatedAt(String date) {
    return '建立於 $date';
  }

  @override
  String get wallTitle => '創意海報牆';

  @override
  String get wallSortTime => '最新';

  @override
  String get wallEmpty => '尚無已通過的海報';

  @override
  String get moderationPrivate => '私有';

  @override
  String get moderationPending => '待審核';

  @override
  String get moderationApproved => '已通過';

  @override
  String get moderationRejected => '已拒絕';

  @override
  String get splashTagline => '調酒，從此隨手可得';

  @override
  String get onboardingStep1Title => '掃描你的冰箱';

  @override
  String get onboardingStep1Desc => '拍照或勾選你有的材料，AI 立刻為你調製專屬配方。';

  @override
  String get onboardingStep2Title => 'AI 調酒';

  @override
  String get onboardingStep2Desc => '根據你的材料和口味，發現獨一無二的配方。';

  @override
  String get onboardingStep3Title => '賽博海報';

  @override
  String get onboardingStep3Desc => '一鍵為你的作品生成精美、可分享的社群海報。';

  @override
  String get onboardingStep4Title => '社群牆';

  @override
  String get onboardingStep4Desc => '加入全球家庭調酒師社群，分享作品、登頂排行榜。';

  @override
  String get onboardingStartButton => '開始調製';

  @override
  String get homeTitle => '我的作品';

  @override
  String get homeEmpty => '還沒有作品，點「製作」開始吧';

  @override
  String get craftMake => '製作';

  @override
  String get craftTemplatesTitle => '製作同款';

  @override
  String get craftDiyTitle => '自選材料';

  @override
  String get craftAddIngredient => '新增材料';

  @override
  String get craftAddIngredientHint => '材料名稱';

  @override
  String get craftShareTemplate => '分享模板';

  @override
  String get craftGeneratePoster => '生成分享圖';

  @override
  String get craftConfirmTitle => '確認儲存';

  @override
  String get craftAddPhotos => '新增成品照';

  @override
  String get craftPhotosOptional => '可選，最多 3 張';

  @override
  String get craftSave => '儲存作品';

  @override
  String get craftSaved => '已儲存到我的作品';

  @override
  String get craftAiGenerated => 'AI 大師作品已生成';

  @override
  String get profileUserId => '使用者 ID';

  @override
  String get profileContactUs => '聯絡我們';

  @override
  String get profilePrivacy => '隱私協議';

  @override
  String get profileTerms => '服務條款';

  @override
  String get profileCopied => '已複製';

  @override
  String get craftScannerTitle => '冰箱掃描';

  @override
  String get craftScanHint => '對準冰箱或吧台，點擊開始掃描';

  @override
  String get craftScanCta => '掃描材料';

  @override
  String get craftScanning => '掃描中…';

  @override
  String craftScanDetected(int count) {
    return '辨識到 $count 種材料';
  }

  @override
  String get craftSaveInventory => '儲存目前庫存';

  @override
  String get craftRescan => '重新掃描';

  @override
  String get craftScanContinue => '繼續';

  @override
  String get craftManualSelect => '直接選材料';

  @override
  String get craftInventorySaved => '庫存已儲存';

  @override
  String get craftRecentScans => '最近掃描';

  @override
  String get homeFeatured => '精選';

  @override
  String get homeHeroCta => '今夜，調一杯屬於你的雞尾酒';

  @override
  String get featuredViewAll => '全部';
}

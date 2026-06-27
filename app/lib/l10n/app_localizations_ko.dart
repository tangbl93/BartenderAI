// ignore: unused_import
import 'package:intl/intl.dart' as intl;
import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for Korean (`ko`).
class AppLocalizationsKo extends AppLocalizations {
  AppLocalizationsKo([String locale = 'ko']) : super(locale);

  @override
  String get commonAppName => 'AI 바텐더';

  @override
  String get commonActionSave => '저장';

  @override
  String get commonActionShare => '공유';

  @override
  String get commonActionCancel => '취소';

  @override
  String get commonActionConfirm => '확인';

  @override
  String get commonActionRetry => '다시 시도';

  @override
  String get commonActionNext => '다음';

  @override
  String get commonActionSkip => '건너뛰기';

  @override
  String get commonActionDone => '완료';

  @override
  String get commonActionDelete => '삭제';

  @override
  String get commonActionEdit => '편집';

  @override
  String get commonActionBack => '뒤로';

  @override
  String get commonLoading => '불러오는 중…';

  @override
  String get commonError => '문제가 발생했습니다';

  @override
  String get commonLanguage => '언어';

  @override
  String get commonSettings => '설정';

  @override
  String get authLoginTitle => '로그인';

  @override
  String get authRegisterTitle => '계정 만들기';

  @override
  String get authAccountLabel => '이메일 또는 전화번호';

  @override
  String get authPasswordLabel => '비밀번호';

  @override
  String get authDisplayNameLabel => '표시 이름';

  @override
  String get authLoginButton => '로그인';

  @override
  String get authRegisterButton => '가입';

  @override
  String get authToRegister => '계정이 없으신가요? 가입하기';

  @override
  String get authToLogin => '이미 계정이 있나요? 로그인';

  @override
  String get authPasswordTooShort => '비밀번호는 8자 이상이어야 합니다';

  @override
  String get authAccountRequired => '계정을 입력하세요';

  @override
  String get authInvalidCredentials => '계정 또는 비밀번호가 올바르지 않습니다';

  @override
  String get authAccountExists => '이미 존재하는 계정입니다';

  @override
  String get authLogout => '로그아웃';

  @override
  String get authPrivacyGaid =>
      '기기의 광고 ID(GAID)를 사용해 자동으로 로그인합니다. Android 「설정 → 개인정보 보호 → 광고」에서 언제든 재설정할 수 있습니다.';

  @override
  String get authSigningIn => '로그인 중…';

  @override
  String get navFridge => '냉장고';

  @override
  String get navWall => '월';

  @override
  String get navLab => '랩';

  @override
  String get navProfile => '내 정보';

  @override
  String get fridgeTitle => '냉장고 열기';

  @override
  String get fridgeSubtitle => '냉장고에 있는 재료를 선택하세요';

  @override
  String get fridgeCategoryBaseSpirit => '베이스 스피릿';

  @override
  String get fridgeCategoryDrink => '음료';

  @override
  String get fridgeCategoryFruit => '과일';

  @override
  String get fridgeCategorySnack => '스낵';

  @override
  String fridgeSelectedCount(int count) {
    return '$count개 선택됨';
  }

  @override
  String get fridgeGenerate => '레시피 생성';

  @override
  String get fridgeNeedMore => '마실 수 있는 레시피를 위해 재료를 2개 이상 선택하세요';

  @override
  String get fridgeClear => '지우기';

  @override
  String get exampleCardTitle => '예시를 사용해 보세요';

  @override
  String get exampleCardSubtitle => '탭하여 전체 예시 레시피 보기';

  @override
  String get onboardingTitle => '환영합니다';

  @override
  String get onboardingStepSelectIngredients => '냉장고에 있는 재료를 선택하세요';

  @override
  String get onboardingStepGenerateRecipe => 'AI가 맞춤 레시피를 만들어 드립니다';

  @override
  String get onboardingStepGeneratePoster => '포스터 매트릭스를 생성해 공유하세요';

  @override
  String get onboardingStepCheckIn => '랩에서 작품을 체크인하세요';

  @override
  String get onboardingReplay => '튜토리얼 다시 보기';

  @override
  String get recipeResultTitle => '내 레시피';

  @override
  String recipeAlcoholRange(String range) {
    return '도수: $range';
  }

  @override
  String get recipeIngredients => '재료';

  @override
  String get recipeSteps => '만드는 법';

  @override
  String get recipeToolSubstitutions => '가정용 도구 대체';

  @override
  String get recipeSafetyNotes => '안전 안내';

  @override
  String get recipeResultAlcoholHint => '적당히 즐기세요. 미성년자 음주는 금지입니다.';

  @override
  String get recipeOptional => '선택';

  @override
  String get recipeGuideTitle => '친절한 가이드';

  @override
  String get recipeMakePoster => '포스터 만들기';

  @override
  String get recipeGenerating => '레시피를 만드는 중…';

  @override
  String get posterTitle => '포스터 매트릭스';

  @override
  String get posterDimensionHomeCloseup => '홈메이드 클로즈업';

  @override
  String get posterDimensionBarCommercial => '바 상업용 포스터';

  @override
  String get posterDimensionStepsLong => '단계 분해 롱이미지';

  @override
  String get posterStatusPending => '대기 중';

  @override
  String get posterStatusRunning => '생성 중';

  @override
  String get posterStatusDone => '완료';

  @override
  String get posterStatusFailed => '실패';

  @override
  String get posterSaveToGallery => '갤러리에 저장';

  @override
  String get posterSaveAll => '모두 저장';

  @override
  String get posterSaved => '갤러리에 저장됨';

  @override
  String get posterGenerating => '포스터 생성 중…';

  @override
  String get posterTimeout => '생성 시간이 초과되었습니다. 다시 시도하세요';

  @override
  String get labTitle => '나의 살짝 취한 랩';

  @override
  String get labEmpty => '아직 체크인이 없습니다. 한 잔 만들어 체크인하세요!';

  @override
  String get labCheckIn => '체크인';

  @override
  String get labResultSuccess => '성공';

  @override
  String get labResultFail => '실패';

  @override
  String get labPickImage => '사진 선택';

  @override
  String get labTakePhoto => '사진 촬영';

  @override
  String get labNoteLabel => '메모';

  @override
  String get labImageRequired => '사진을 추가하세요';

  @override
  String get labResultRequired => '성공 또는 실패를 표시하세요';

  @override
  String get labSubmitToWall => '월에 제출';

  @override
  String get labSubmittedPending => '제출됨, 심사 대기 중';

  @override
  String get labDetailTitle => '작품 상세';

  @override
  String labCreatedAt(String date) {
    return '생성일 $date';
  }

  @override
  String get wallTitle => '창작 포스터 월';

  @override
  String get wallSortHot => '인기';

  @override
  String get wallSortTime => '최신';

  @override
  String get wallEmpty => '아직 승인된 포스터가 없습니다';

  @override
  String get moderationPrivate => '비공개';

  @override
  String get moderationPending => '심사 대기';

  @override
  String get moderationApproved => '승인됨';

  @override
  String get moderationRejected => '거부됨';

  @override
  String get splashTagline => '칵테일, 이제 손쉽게';

  @override
  String get onboardingStep1Title => '냉장고 스캔';

  @override
  String get onboardingStep1Desc =>
      '사진을 찍거나 재료를 고르면, AI가 당신만의 칵테일 레시피를 즉시 만들어 드려요.';

  @override
  String get onboardingStep2Title => 'AI 믹솔로지';

  @override
  String get onboardingStep2Desc => '보유 재료와 취향에 맞춘 특별한 칵테일을 발견하세요.';

  @override
  String get onboardingStep3Title => '사이버 포스터';

  @override
  String get onboardingStep3Desc => '작품을 원클릭으로 공유하기 좋은 SNS 포스터로 만들어 보세요.';

  @override
  String get onboardingStep4Title => '커뮤니티 월';

  @override
  String get onboardingStep4Desc => '전 세계 홈 바텐더와 연결되세요. 작품을 공유하고 순위를 올려보세요.';

  @override
  String get onboardingStartButton => '믹스 시작';

  @override
  String get homeTitle => '내 작품';

  @override
  String get homeEmpty => '아직 작품이 없어요. 「제작」을 눌러 시작하세요';

  @override
  String get craftMake => '제작';

  @override
  String get craftTemplatesTitle => '같은 걸로 제작';

  @override
  String get craftDiyTitle => '재료 선택';

  @override
  String get craftAddIngredient => '재료 추가';

  @override
  String get craftAddIngredientHint => '재료 이름';

  @override
  String get craftShareTemplate => '공유 템플릿';

  @override
  String get craftGeneratePoster => '공유 이미지 생성';

  @override
  String get craftConfirmTitle => '저장 확인';

  @override
  String get craftAddPhotos => '완성 사진 추가';

  @override
  String get craftPhotosOptional => '선택, 최대 3장';

  @override
  String get craftSave => '작품 저장';

  @override
  String get craftSaved => '내 작품에 저장됨';

  @override
  String get craftAiGenerated => 'AI 마스터피스 생성 완료';

  @override
  String get profileUserId => '사용자 ID';

  @override
  String get profileContactUs => '문의하기';

  @override
  String get profilePrivacy => '개인정보처리방침';

  @override
  String get profileTerms => '이용약관';

  @override
  String get profileCopied => '복사됨';

  @override
  String get craftScannerTitle => '냉장고 스캔';

  @override
  String get craftScanHint => '냉장고나 바를 향해 탭하여 스캔';

  @override
  String get craftScanCta => '재료 스캔';

  @override
  String get craftScanning => '스캔 중…';

  @override
  String craftScanDetected(int count) {
    return '재료 $count개 인식됨';
  }

  @override
  String get craftSaveInventory => '재고 저장';

  @override
  String get craftRescan => '다시 스캔';

  @override
  String get craftScanContinue => '계속';

  @override
  String get craftManualSelect => '직접 선택';

  @override
  String get craftInventorySaved => '재고가 저장되었습니다';

  @override
  String get craftRecentScans => '최근 스캔';

  @override
  String get homeFeatured => '추천';

  @override
  String get homeHeroCta => '오늘 밤, 당신만의 칵테일을';

  @override
  String get featuredViewAll => '전체 보기';
}

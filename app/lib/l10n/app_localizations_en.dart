// ignore: unused_import
import 'package:intl/intl.dart' as intl;
import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for English (`en`).
class AppLocalizationsEn extends AppLocalizations {
  AppLocalizationsEn([String locale = 'en']) : super(locale);

  @override
  String get commonAppName => 'Home Bartender AI';

  @override
  String get commonActionSave => 'Save';

  @override
  String get commonActionShare => 'Share';

  @override
  String get commonActionCancel => 'Cancel';

  @override
  String get commonActionConfirm => 'Confirm';

  @override
  String get commonActionRetry => 'Retry';

  @override
  String get commonActionNext => 'Next';

  @override
  String get commonActionSkip => 'Skip';

  @override
  String get commonActionDone => 'Done';

  @override
  String get commonActionDelete => 'Delete';

  @override
  String get commonActionEdit => 'Edit';

  @override
  String get commonActionBack => 'Back';

  @override
  String get commonLoading => 'Loading...';

  @override
  String get commonError => 'Something went wrong';

  @override
  String get commonLanguage => 'Language';

  @override
  String get commonSettings => 'Settings';

  @override
  String get authLoginTitle => 'Sign in';

  @override
  String get authRegisterTitle => 'Create account';

  @override
  String get authAccountLabel => 'Email or phone';

  @override
  String get authPasswordLabel => 'Password';

  @override
  String get authDisplayNameLabel => 'Display name';

  @override
  String get authLoginButton => 'Sign in';

  @override
  String get authRegisterButton => 'Register';

  @override
  String get authToRegister => 'No account? Register';

  @override
  String get authToLogin => 'Have an account? Sign in';

  @override
  String get authPasswordTooShort => 'Password must be at least 8 characters';

  @override
  String get authAccountRequired => 'Account is required';

  @override
  String get authInvalidCredentials => 'Incorrect account or password';

  @override
  String get authAccountExists => 'Account already exists';

  @override
  String get authLogout => 'Sign out';

  @override
  String get authPrivacyGaid =>
      'We use your device\'s advertising ID to sign you in automatically. You can reset it anytime in Android Settings > Privacy > Ads.';

  @override
  String get authSigningIn => 'Signing you in…';

  @override
  String get navFridge => 'Fridge';

  @override
  String get navWall => 'Wall';

  @override
  String get navLab => 'Lab';

  @override
  String get navProfile => 'Profile';

  @override
  String get fridgeTitle => 'Open the fridge';

  @override
  String get fridgeSubtitle => 'Tick the ingredients you have';

  @override
  String get fridgeCategoryBaseSpirit => 'Base spirits';

  @override
  String get fridgeCategoryDrink => 'Drinks';

  @override
  String get fridgeCategoryFruit => 'Fruits';

  @override
  String get fridgeCategorySnack => 'Snacks';

  @override
  String fridgeSelectedCount(int count) {
    return '$count selected';
  }

  @override
  String get fridgeGenerate => 'Generate recipe';

  @override
  String get fridgeNeedMore =>
      'Pick at least 2 ingredients to mix a drinkable recipe';

  @override
  String get fridgeClear => 'Clear';

  @override
  String get exampleCardTitle => 'Try these examples';

  @override
  String get exampleCardSubtitle => 'Tap to view a full sample recipe';

  @override
  String get onboardingTitle => 'Welcome';

  @override
  String get onboardingStepSelectIngredients => 'Tick what\'s in your fridge';

  @override
  String get onboardingStepGenerateRecipe => 'AI mixes a custom recipe for you';

  @override
  String get onboardingStepGeneratePoster =>
      'Generate a poster matrix to share';

  @override
  String get onboardingStepCheckIn => 'Check in your creations in the Lab';

  @override
  String get onboardingReplay => 'Replay tutorial';

  @override
  String get recipeResultTitle => 'Your recipe';

  @override
  String recipeAlcoholRange(String range) {
    return 'Alcohol: $range';
  }

  @override
  String get recipeIngredients => 'Ingredients';

  @override
  String get recipeSteps => 'Steps';

  @override
  String get recipeToolSubstitutions => 'Home tool swaps';

  @override
  String get recipeSafetyNotes => 'Safety notes';

  @override
  String get recipeResultAlcoholHint =>
      'Please drink responsibly. No alcohol for minors.';

  @override
  String get recipeOptional => 'optional';

  @override
  String get recipeGuideTitle => 'Step-by-step guide';

  @override
  String get recipeMakePoster => 'Make posters';

  @override
  String get recipeGenerating => 'Mixing your recipe...';

  @override
  String get posterTitle => 'Poster matrix';

  @override
  String get posterDimensionHomeCloseup => 'Home close-up';

  @override
  String get posterDimensionBarCommercial => 'Bar commercial';

  @override
  String get posterDimensionStepsLong => 'Steps long-image';

  @override
  String get posterStatusPending => 'Pending';

  @override
  String get posterStatusRunning => 'Generating';

  @override
  String get posterStatusDone => 'Done';

  @override
  String get posterStatusFailed => 'Failed';

  @override
  String get posterSaveToGallery => 'Save to gallery';

  @override
  String get posterSaveAll => 'Save all';

  @override
  String get posterSaved => 'Saved to gallery';

  @override
  String get posterGenerating => 'Generating posters...';

  @override
  String get posterTimeout => 'Generation timed out, please retry';

  @override
  String get labTitle => 'My Tasting Lab';

  @override
  String get labEmpty => 'No check-ins yet. Mix something and check in!';

  @override
  String get labCheckIn => 'Check in';

  @override
  String get labResultSuccess => 'Success';

  @override
  String get labResultFail => 'Flopped';

  @override
  String get labPickImage => 'Pick photo';

  @override
  String get labTakePhoto => 'Take photo';

  @override
  String get labNoteLabel => 'Note';

  @override
  String get labImageRequired => 'Please add a photo';

  @override
  String get labResultRequired => 'Please mark success or flop';

  @override
  String get labSubmitToWall => 'Submit to wall';

  @override
  String get labSubmittedPending => 'Submitted, pending review';

  @override
  String get labDetailTitle => 'Creation detail';

  @override
  String labCreatedAt(String date) {
    return 'Created $date';
  }

  @override
  String get wallTitle => 'Creative poster wall';

  @override
  String get wallSortHot => 'Hot';

  @override
  String get wallSortTime => 'Newest';

  @override
  String get wallEmpty => 'No approved posters yet';

  @override
  String get moderationPrivate => 'Private';

  @override
  String get moderationPending => 'Pending review';

  @override
  String get moderationApproved => 'Approved';

  @override
  String get moderationRejected => 'Rejected';

  @override
  String get splashTagline => 'Mixology, now within reach';

  @override
  String get onboardingStep1Title => 'Scan Your Fridge';

  @override
  String get onboardingStep1Desc =>
      'Snap a photo or list your ingredients. Our AI will instantly craft personalized cocktail recipes just for you.';

  @override
  String get onboardingStep2Title => 'AI Mixology';

  @override
  String get onboardingStep2Desc =>
      'Discover unique cocktails tailored specifically to your inventory and taste profile.';

  @override
  String get onboardingStep3Title => 'Cyber Posters';

  @override
  String get onboardingStep3Desc =>
      'Generate stunning, shareable social media posters for your liquid creations in a single click.';

  @override
  String get onboardingStep4Title => 'Community Wall';

  @override
  String get onboardingStep4Desc =>
      'Join a global network of home mixologists. Share your drinks and climb the leaderboard.';

  @override
  String get onboardingStartButton => 'Start Mixing';

  @override
  String get homeTitle => 'My Creations';

  @override
  String get homeEmpty => 'No creations yet. Tap Craft to start.';

  @override
  String get craftMake => 'Craft';

  @override
  String get craftTemplatesTitle => 'Make the same';

  @override
  String get craftDiyTitle => 'Pick your own';

  @override
  String get craftAddIngredient => 'Add ingredient';

  @override
  String get craftAddIngredientHint => 'Ingredient name';

  @override
  String get craftGeneratePoster => 'Generate share image';

  @override
  String get craftConfirmTitle => 'Save creation';

  @override
  String get craftAddPhotos => 'Add finished photos';

  @override
  String get craftPhotosOptional => 'Optional, up to 3';

  @override
  String get craftSave => 'Save creation';

  @override
  String get craftSaved => 'Saved to your creations';

  @override
  String get craftAiGenerated => 'AI MASTERPIECE GENERATED';

  @override
  String get profileUserId => 'User ID';

  @override
  String get profileContactUs => 'Contact us';

  @override
  String get profilePrivacy => 'Privacy policy';

  @override
  String get profileTerms => 'Terms of service';

  @override
  String get profileCopied => 'Copied';

  @override
  String get craftScannerTitle => 'Fridge Scanner';

  @override
  String get craftScanHint => 'Point at your fridge or bar and tap to scan';

  @override
  String get craftScanCta => 'Scan ingredients';

  @override
  String get craftScanning => 'Scanning…';

  @override
  String craftScanDetected(int count) {
    return '$count ingredients found';
  }

  @override
  String get craftSaveInventory => 'Save inventory';

  @override
  String get craftRescan => 'Re-scan';

  @override
  String get craftScanContinue => 'Continue';

  @override
  String get craftManualSelect => 'Pick manually';

  @override
  String get craftInventorySaved => 'Inventory saved';

  @override
  String get craftRecentScans => 'Recent scans';

  @override
  String get homeFeatured => 'Featured';
}

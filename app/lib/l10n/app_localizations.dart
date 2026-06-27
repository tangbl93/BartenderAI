import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:intl/intl.dart' as intl;

import 'app_localizations_en.dart';
import 'app_localizations_ja.dart';
import 'app_localizations_ko.dart';
import 'app_localizations_zh.dart';

// ignore_for_file: type=lint

/// Callers can lookup localized strings with an instance of AppLocalizations
/// returned by `AppLocalizations.of(context)`.
///
/// Applications need to include `AppLocalizations.delegate()` in their app's
/// `localizationDelegates` list, and the locales they support in the app's
/// `supportedLocales` list. For example:
///
/// ```dart
/// import 'l10n/app_localizations.dart';
///
/// return MaterialApp(
///   localizationsDelegates: AppLocalizations.localizationsDelegates,
///   supportedLocales: AppLocalizations.supportedLocales,
///   home: MyApplicationHome(),
/// );
/// ```
///
/// ## Update pubspec.yaml
///
/// Please make sure to update your pubspec.yaml to include the following
/// packages:
///
/// ```yaml
/// dependencies:
///   # Internationalization support.
///   flutter_localizations:
///     sdk: flutter
///   intl: any # Use the pinned version from flutter_localizations
///
///   # Rest of dependencies
/// ```
///
/// ## iOS Applications
///
/// iOS applications define key application metadata, including supported
/// locales, in an Info.plist file that is built into the application bundle.
/// To configure the locales supported by your app, you’ll need to edit this
/// file.
///
/// First, open your project’s ios/Runner.xcworkspace Xcode workspace file.
/// Then, in the Project Navigator, open the Info.plist file under the Runner
/// project’s Runner folder.
///
/// Next, select the Information Property List item, select Add Item from the
/// Editor menu, then select Localizations from the pop-up menu.
///
/// Select and expand the newly-created Localizations item then, for each
/// locale your application supports, add a new item and select the locale
/// you wish to add from the pop-up menu in the Value field. This list should
/// be consistent with the languages listed in the AppLocalizations.supportedLocales
/// property.
abstract class AppLocalizations {
  AppLocalizations(String locale)
    : localeName = intl.Intl.canonicalizedLocale(locale.toString());

  final String localeName;

  static AppLocalizations of(BuildContext context) {
    return Localizations.of<AppLocalizations>(context, AppLocalizations)!;
  }

  static const LocalizationsDelegate<AppLocalizations> delegate =
      _AppLocalizationsDelegate();

  /// A list of this localizations delegate along with the default localizations
  /// delegates.
  ///
  /// Returns a list of localizations delegates containing this delegate along with
  /// GlobalMaterialLocalizations.delegate, GlobalCupertinoLocalizations.delegate,
  /// and GlobalWidgetsLocalizations.delegate.
  ///
  /// Additional delegates can be added by appending to this list in
  /// MaterialApp. This list does not have to be used at all if a custom list
  /// of delegates is preferred or required.
  static const List<LocalizationsDelegate<dynamic>> localizationsDelegates =
      <LocalizationsDelegate<dynamic>>[
        delegate,
        GlobalMaterialLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
      ];

  /// A list of this localizations delegate's supported locales.
  static const List<Locale> supportedLocales = <Locale>[
    Locale('en'),
    Locale('ja'),
    Locale('ko'),
    Locale('zh'),
    Locale('zh', 'CN'),
    Locale('zh', 'TW'),
  ];

  /// Application name
  ///
  /// In en, this message translates to:
  /// **'Home Bartender AI'**
  String get commonAppName;

  /// No description provided for @commonActionSave.
  ///
  /// In en, this message translates to:
  /// **'Save'**
  String get commonActionSave;

  /// No description provided for @commonActionShare.
  ///
  /// In en, this message translates to:
  /// **'Share'**
  String get commonActionShare;

  /// No description provided for @commonActionCancel.
  ///
  /// In en, this message translates to:
  /// **'Cancel'**
  String get commonActionCancel;

  /// No description provided for @commonActionConfirm.
  ///
  /// In en, this message translates to:
  /// **'Confirm'**
  String get commonActionConfirm;

  /// No description provided for @commonActionRetry.
  ///
  /// In en, this message translates to:
  /// **'Retry'**
  String get commonActionRetry;

  /// No description provided for @commonActionNext.
  ///
  /// In en, this message translates to:
  /// **'Next'**
  String get commonActionNext;

  /// No description provided for @commonActionSkip.
  ///
  /// In en, this message translates to:
  /// **'Skip'**
  String get commonActionSkip;

  /// No description provided for @commonActionDone.
  ///
  /// In en, this message translates to:
  /// **'Done'**
  String get commonActionDone;

  /// No description provided for @commonActionDelete.
  ///
  /// In en, this message translates to:
  /// **'Delete'**
  String get commonActionDelete;

  /// No description provided for @commonActionEdit.
  ///
  /// In en, this message translates to:
  /// **'Edit'**
  String get commonActionEdit;

  /// No description provided for @commonActionBack.
  ///
  /// In en, this message translates to:
  /// **'Back'**
  String get commonActionBack;

  /// No description provided for @commonLoading.
  ///
  /// In en, this message translates to:
  /// **'Loading...'**
  String get commonLoading;

  /// No description provided for @commonError.
  ///
  /// In en, this message translates to:
  /// **'Something went wrong'**
  String get commonError;

  /// No description provided for @commonLanguage.
  ///
  /// In en, this message translates to:
  /// **'Language'**
  String get commonLanguage;

  /// No description provided for @commonSettings.
  ///
  /// In en, this message translates to:
  /// **'Settings'**
  String get commonSettings;

  /// No description provided for @authLoginTitle.
  ///
  /// In en, this message translates to:
  /// **'Sign in'**
  String get authLoginTitle;

  /// No description provided for @authRegisterTitle.
  ///
  /// In en, this message translates to:
  /// **'Create account'**
  String get authRegisterTitle;

  /// No description provided for @authAccountLabel.
  ///
  /// In en, this message translates to:
  /// **'Email or phone'**
  String get authAccountLabel;

  /// No description provided for @authPasswordLabel.
  ///
  /// In en, this message translates to:
  /// **'Password'**
  String get authPasswordLabel;

  /// No description provided for @authDisplayNameLabel.
  ///
  /// In en, this message translates to:
  /// **'Display name'**
  String get authDisplayNameLabel;

  /// No description provided for @authLoginButton.
  ///
  /// In en, this message translates to:
  /// **'Sign in'**
  String get authLoginButton;

  /// No description provided for @authRegisterButton.
  ///
  /// In en, this message translates to:
  /// **'Register'**
  String get authRegisterButton;

  /// No description provided for @authToRegister.
  ///
  /// In en, this message translates to:
  /// **'No account? Register'**
  String get authToRegister;

  /// No description provided for @authToLogin.
  ///
  /// In en, this message translates to:
  /// **'Have an account? Sign in'**
  String get authToLogin;

  /// No description provided for @authPasswordTooShort.
  ///
  /// In en, this message translates to:
  /// **'Password must be at least 8 characters'**
  String get authPasswordTooShort;

  /// No description provided for @authAccountRequired.
  ///
  /// In en, this message translates to:
  /// **'Account is required'**
  String get authAccountRequired;

  /// No description provided for @authInvalidCredentials.
  ///
  /// In en, this message translates to:
  /// **'Incorrect account or password'**
  String get authInvalidCredentials;

  /// No description provided for @authAccountExists.
  ///
  /// In en, this message translates to:
  /// **'Account already exists'**
  String get authAccountExists;

  /// No description provided for @authLogout.
  ///
  /// In en, this message translates to:
  /// **'Sign out'**
  String get authLogout;

  /// Privacy notice explaining GAID usage for device auto-login
  ///
  /// In en, this message translates to:
  /// **'We use your device\'s advertising ID to sign you in automatically. You can reset it anytime in Android Settings > Privacy > Ads.'**
  String get authPrivacyGaid;

  /// No description provided for @authSigningIn.
  ///
  /// In en, this message translates to:
  /// **'Signing you in…'**
  String get authSigningIn;

  /// No description provided for @navFridge.
  ///
  /// In en, this message translates to:
  /// **'Fridge'**
  String get navFridge;

  /// No description provided for @navWall.
  ///
  /// In en, this message translates to:
  /// **'Wall'**
  String get navWall;

  /// No description provided for @navLab.
  ///
  /// In en, this message translates to:
  /// **'Lab'**
  String get navLab;

  /// No description provided for @navProfile.
  ///
  /// In en, this message translates to:
  /// **'Profile'**
  String get navProfile;

  /// No description provided for @fridgeTitle.
  ///
  /// In en, this message translates to:
  /// **'Open the fridge'**
  String get fridgeTitle;

  /// No description provided for @fridgeSubtitle.
  ///
  /// In en, this message translates to:
  /// **'Tick the ingredients you have'**
  String get fridgeSubtitle;

  /// No description provided for @fridgeCategoryBaseSpirit.
  ///
  /// In en, this message translates to:
  /// **'Base spirits'**
  String get fridgeCategoryBaseSpirit;

  /// No description provided for @fridgeCategoryDrink.
  ///
  /// In en, this message translates to:
  /// **'Drinks'**
  String get fridgeCategoryDrink;

  /// No description provided for @fridgeCategoryFruit.
  ///
  /// In en, this message translates to:
  /// **'Fruits'**
  String get fridgeCategoryFruit;

  /// No description provided for @fridgeCategorySnack.
  ///
  /// In en, this message translates to:
  /// **'Snacks'**
  String get fridgeCategorySnack;

  /// No description provided for @fridgeSelectedCount.
  ///
  /// In en, this message translates to:
  /// **'{count} selected'**
  String fridgeSelectedCount(int count);

  /// No description provided for @fridgeGenerate.
  ///
  /// In en, this message translates to:
  /// **'Generate recipe'**
  String get fridgeGenerate;

  /// No description provided for @fridgeNeedMore.
  ///
  /// In en, this message translates to:
  /// **'Pick at least 2 ingredients to mix a drinkable recipe'**
  String get fridgeNeedMore;

  /// No description provided for @fridgeClear.
  ///
  /// In en, this message translates to:
  /// **'Clear'**
  String get fridgeClear;

  /// No description provided for @exampleCardTitle.
  ///
  /// In en, this message translates to:
  /// **'Try these examples'**
  String get exampleCardTitle;

  /// No description provided for @exampleCardSubtitle.
  ///
  /// In en, this message translates to:
  /// **'Tap to view a full sample recipe'**
  String get exampleCardSubtitle;

  /// No description provided for @onboardingTitle.
  ///
  /// In en, this message translates to:
  /// **'Welcome'**
  String get onboardingTitle;

  /// No description provided for @onboardingStepSelectIngredients.
  ///
  /// In en, this message translates to:
  /// **'Tick what\'s in your fridge'**
  String get onboardingStepSelectIngredients;

  /// No description provided for @onboardingStepGenerateRecipe.
  ///
  /// In en, this message translates to:
  /// **'AI mixes a custom recipe for you'**
  String get onboardingStepGenerateRecipe;

  /// No description provided for @onboardingStepGeneratePoster.
  ///
  /// In en, this message translates to:
  /// **'Generate a poster matrix to share'**
  String get onboardingStepGeneratePoster;

  /// No description provided for @onboardingStepCheckIn.
  ///
  /// In en, this message translates to:
  /// **'Check in your creations in the Lab'**
  String get onboardingStepCheckIn;

  /// No description provided for @onboardingReplay.
  ///
  /// In en, this message translates to:
  /// **'Replay tutorial'**
  String get onboardingReplay;

  /// No description provided for @recipeResultTitle.
  ///
  /// In en, this message translates to:
  /// **'Your recipe'**
  String get recipeResultTitle;

  /// No description provided for @recipeAlcoholRange.
  ///
  /// In en, this message translates to:
  /// **'Alcohol: {range}'**
  String recipeAlcoholRange(String range);

  /// No description provided for @recipeIngredients.
  ///
  /// In en, this message translates to:
  /// **'Ingredients'**
  String get recipeIngredients;

  /// No description provided for @recipeSteps.
  ///
  /// In en, this message translates to:
  /// **'Steps'**
  String get recipeSteps;

  /// No description provided for @recipeToolSubstitutions.
  ///
  /// In en, this message translates to:
  /// **'Home tool swaps'**
  String get recipeToolSubstitutions;

  /// No description provided for @recipeSafetyNotes.
  ///
  /// In en, this message translates to:
  /// **'Safety notes'**
  String get recipeSafetyNotes;

  /// No description provided for @recipeResultAlcoholHint.
  ///
  /// In en, this message translates to:
  /// **'Please drink responsibly. No alcohol for minors.'**
  String get recipeResultAlcoholHint;

  /// No description provided for @recipeOptional.
  ///
  /// In en, this message translates to:
  /// **'optional'**
  String get recipeOptional;

  /// No description provided for @recipeGuideTitle.
  ///
  /// In en, this message translates to:
  /// **'Step-by-step guide'**
  String get recipeGuideTitle;

  /// No description provided for @recipeMakePoster.
  ///
  /// In en, this message translates to:
  /// **'Make posters'**
  String get recipeMakePoster;

  /// No description provided for @recipeGenerating.
  ///
  /// In en, this message translates to:
  /// **'Mixing your recipe...'**
  String get recipeGenerating;

  /// No description provided for @posterTitle.
  ///
  /// In en, this message translates to:
  /// **'Poster matrix'**
  String get posterTitle;

  /// No description provided for @posterDimensionHomeCloseup.
  ///
  /// In en, this message translates to:
  /// **'Home close-up'**
  String get posterDimensionHomeCloseup;

  /// No description provided for @posterDimensionBarCommercial.
  ///
  /// In en, this message translates to:
  /// **'Bar commercial'**
  String get posterDimensionBarCommercial;

  /// No description provided for @posterDimensionStepsLong.
  ///
  /// In en, this message translates to:
  /// **'Steps long-image'**
  String get posterDimensionStepsLong;

  /// No description provided for @posterStatusPending.
  ///
  /// In en, this message translates to:
  /// **'Pending'**
  String get posterStatusPending;

  /// No description provided for @posterStatusRunning.
  ///
  /// In en, this message translates to:
  /// **'Generating'**
  String get posterStatusRunning;

  /// No description provided for @posterStatusDone.
  ///
  /// In en, this message translates to:
  /// **'Done'**
  String get posterStatusDone;

  /// No description provided for @posterStatusFailed.
  ///
  /// In en, this message translates to:
  /// **'Failed'**
  String get posterStatusFailed;

  /// No description provided for @posterSaveToGallery.
  ///
  /// In en, this message translates to:
  /// **'Save to gallery'**
  String get posterSaveToGallery;

  /// No description provided for @posterSaveAll.
  ///
  /// In en, this message translates to:
  /// **'Save all'**
  String get posterSaveAll;

  /// No description provided for @posterSaved.
  ///
  /// In en, this message translates to:
  /// **'Saved to gallery'**
  String get posterSaved;

  /// No description provided for @posterGenerating.
  ///
  /// In en, this message translates to:
  /// **'Generating posters...'**
  String get posterGenerating;

  /// No description provided for @posterTimeout.
  ///
  /// In en, this message translates to:
  /// **'Generation timed out, please retry'**
  String get posterTimeout;

  /// No description provided for @labTitle.
  ///
  /// In en, this message translates to:
  /// **'My Tasting Lab'**
  String get labTitle;

  /// No description provided for @labEmpty.
  ///
  /// In en, this message translates to:
  /// **'No check-ins yet. Mix something and check in!'**
  String get labEmpty;

  /// No description provided for @labCheckIn.
  ///
  /// In en, this message translates to:
  /// **'Check in'**
  String get labCheckIn;

  /// No description provided for @labResultSuccess.
  ///
  /// In en, this message translates to:
  /// **'Success'**
  String get labResultSuccess;

  /// No description provided for @labResultFail.
  ///
  /// In en, this message translates to:
  /// **'Flopped'**
  String get labResultFail;

  /// No description provided for @labPickImage.
  ///
  /// In en, this message translates to:
  /// **'Pick photo'**
  String get labPickImage;

  /// No description provided for @labTakePhoto.
  ///
  /// In en, this message translates to:
  /// **'Take photo'**
  String get labTakePhoto;

  /// No description provided for @labNoteLabel.
  ///
  /// In en, this message translates to:
  /// **'Note'**
  String get labNoteLabel;

  /// No description provided for @labImageRequired.
  ///
  /// In en, this message translates to:
  /// **'Please add a photo'**
  String get labImageRequired;

  /// No description provided for @labResultRequired.
  ///
  /// In en, this message translates to:
  /// **'Please mark success or flop'**
  String get labResultRequired;

  /// No description provided for @labSubmitToWall.
  ///
  /// In en, this message translates to:
  /// **'Submit to wall'**
  String get labSubmitToWall;

  /// No description provided for @labSubmittedPending.
  ///
  /// In en, this message translates to:
  /// **'Submitted, pending review'**
  String get labSubmittedPending;

  /// No description provided for @labDetailTitle.
  ///
  /// In en, this message translates to:
  /// **'Creation detail'**
  String get labDetailTitle;

  /// No description provided for @labCreatedAt.
  ///
  /// In en, this message translates to:
  /// **'Created {date}'**
  String labCreatedAt(String date);

  /// No description provided for @wallTitle.
  ///
  /// In en, this message translates to:
  /// **'Creative poster wall'**
  String get wallTitle;

  /// No description provided for @wallSortHot.
  ///
  /// In en, this message translates to:
  /// **'Hot'**
  String get wallSortHot;

  /// No description provided for @wallSortTime.
  ///
  /// In en, this message translates to:
  /// **'Newest'**
  String get wallSortTime;

  /// No description provided for @wallEmpty.
  ///
  /// In en, this message translates to:
  /// **'No approved posters yet'**
  String get wallEmpty;

  /// No description provided for @moderationPrivate.
  ///
  /// In en, this message translates to:
  /// **'Private'**
  String get moderationPrivate;

  /// No description provided for @moderationPending.
  ///
  /// In en, this message translates to:
  /// **'Pending review'**
  String get moderationPending;

  /// No description provided for @moderationApproved.
  ///
  /// In en, this message translates to:
  /// **'Approved'**
  String get moderationApproved;

  /// No description provided for @moderationRejected.
  ///
  /// In en, this message translates to:
  /// **'Rejected'**
  String get moderationRejected;

  /// Splash screen tagline under the brand name.
  ///
  /// In en, this message translates to:
  /// **'Mixology, now within reach'**
  String get splashTagline;

  /// No description provided for @onboardingStep1Title.
  ///
  /// In en, this message translates to:
  /// **'Scan Your Fridge'**
  String get onboardingStep1Title;

  /// No description provided for @onboardingStep1Desc.
  ///
  /// In en, this message translates to:
  /// **'Snap a photo or list your ingredients. Our AI will instantly craft personalized cocktail recipes just for you.'**
  String get onboardingStep1Desc;

  /// No description provided for @onboardingStep2Title.
  ///
  /// In en, this message translates to:
  /// **'AI Mixology'**
  String get onboardingStep2Title;

  /// No description provided for @onboardingStep2Desc.
  ///
  /// In en, this message translates to:
  /// **'Discover unique cocktails tailored specifically to your inventory and taste profile.'**
  String get onboardingStep2Desc;

  /// No description provided for @onboardingStep3Title.
  ///
  /// In en, this message translates to:
  /// **'Cyber Posters'**
  String get onboardingStep3Title;

  /// No description provided for @onboardingStep3Desc.
  ///
  /// In en, this message translates to:
  /// **'Generate stunning, shareable social media posters for your liquid creations in a single click.'**
  String get onboardingStep3Desc;

  /// No description provided for @onboardingStep4Title.
  ///
  /// In en, this message translates to:
  /// **'Community Wall'**
  String get onboardingStep4Title;

  /// No description provided for @onboardingStep4Desc.
  ///
  /// In en, this message translates to:
  /// **'Join a global network of home mixologists. Share your drinks and climb the leaderboard.'**
  String get onboardingStep4Desc;

  /// No description provided for @onboardingStartButton.
  ///
  /// In en, this message translates to:
  /// **'Start Mixing'**
  String get onboardingStartButton;

  /// No description provided for @homeTitle.
  ///
  /// In en, this message translates to:
  /// **'My Creations'**
  String get homeTitle;

  /// No description provided for @homeEmpty.
  ///
  /// In en, this message translates to:
  /// **'No creations yet. Tap Craft to start.'**
  String get homeEmpty;

  /// No description provided for @craftMake.
  ///
  /// In en, this message translates to:
  /// **'Craft'**
  String get craftMake;

  /// No description provided for @craftTemplatesTitle.
  ///
  /// In en, this message translates to:
  /// **'Make the same'**
  String get craftTemplatesTitle;

  /// No description provided for @craftDiyTitle.
  ///
  /// In en, this message translates to:
  /// **'Pick your own'**
  String get craftDiyTitle;

  /// No description provided for @craftAddIngredient.
  ///
  /// In en, this message translates to:
  /// **'Add ingredient'**
  String get craftAddIngredient;

  /// No description provided for @craftAddIngredientHint.
  ///
  /// In en, this message translates to:
  /// **'Ingredient name'**
  String get craftAddIngredientHint;

  /// No description provided for @craftShareTemplate.
  ///
  /// In en, this message translates to:
  /// **'Share template'**
  String get craftShareTemplate;

  /// No description provided for @craftGeneratePoster.
  ///
  /// In en, this message translates to:
  /// **'Generate share image'**
  String get craftGeneratePoster;

  /// No description provided for @craftConfirmTitle.
  ///
  /// In en, this message translates to:
  /// **'Save creation'**
  String get craftConfirmTitle;

  /// No description provided for @craftAddPhotos.
  ///
  /// In en, this message translates to:
  /// **'Add finished photos'**
  String get craftAddPhotos;

  /// No description provided for @craftPhotosOptional.
  ///
  /// In en, this message translates to:
  /// **'Optional, up to 3'**
  String get craftPhotosOptional;

  /// No description provided for @craftSave.
  ///
  /// In en, this message translates to:
  /// **'Save creation'**
  String get craftSave;

  /// No description provided for @craftSaved.
  ///
  /// In en, this message translates to:
  /// **'Saved to your creations'**
  String get craftSaved;

  /// No description provided for @craftAiGenerated.
  ///
  /// In en, this message translates to:
  /// **'AI MASTERPIECE GENERATED'**
  String get craftAiGenerated;

  /// No description provided for @profileUserId.
  ///
  /// In en, this message translates to:
  /// **'User ID'**
  String get profileUserId;

  /// No description provided for @profileContactUs.
  ///
  /// In en, this message translates to:
  /// **'Contact us'**
  String get profileContactUs;

  /// No description provided for @profilePrivacy.
  ///
  /// In en, this message translates to:
  /// **'Privacy policy'**
  String get profilePrivacy;

  /// No description provided for @profileTerms.
  ///
  /// In en, this message translates to:
  /// **'Terms of service'**
  String get profileTerms;

  /// No description provided for @profileCopied.
  ///
  /// In en, this message translates to:
  /// **'Copied'**
  String get profileCopied;

  /// No description provided for @craftScannerTitle.
  ///
  /// In en, this message translates to:
  /// **'Fridge Scanner'**
  String get craftScannerTitle;

  /// No description provided for @craftScanHint.
  ///
  /// In en, this message translates to:
  /// **'Point at your fridge or bar and tap to scan'**
  String get craftScanHint;

  /// No description provided for @craftScanCta.
  ///
  /// In en, this message translates to:
  /// **'Scan ingredients'**
  String get craftScanCta;

  /// No description provided for @craftScanning.
  ///
  /// In en, this message translates to:
  /// **'Scanning…'**
  String get craftScanning;

  /// No description provided for @craftScanDetected.
  ///
  /// In en, this message translates to:
  /// **'{count} ingredients found'**
  String craftScanDetected(int count);

  /// No description provided for @craftSaveInventory.
  ///
  /// In en, this message translates to:
  /// **'Save inventory'**
  String get craftSaveInventory;

  /// No description provided for @craftRescan.
  ///
  /// In en, this message translates to:
  /// **'Re-scan'**
  String get craftRescan;

  /// No description provided for @craftScanContinue.
  ///
  /// In en, this message translates to:
  /// **'Continue'**
  String get craftScanContinue;

  /// No description provided for @craftManualSelect.
  ///
  /// In en, this message translates to:
  /// **'Pick manually'**
  String get craftManualSelect;

  /// No description provided for @craftInventorySaved.
  ///
  /// In en, this message translates to:
  /// **'Inventory saved'**
  String get craftInventorySaved;

  /// No description provided for @craftRecentScans.
  ///
  /// In en, this message translates to:
  /// **'Recent scans'**
  String get craftRecentScans;

  /// No description provided for @homeFeatured.
  ///
  /// In en, this message translates to:
  /// **'Featured'**
  String get homeFeatured;

  /// No description provided for @homeHeroCta.
  ///
  /// In en, this message translates to:
  /// **'Mix your perfect cocktail tonight'**
  String get homeHeroCta;

  /// No description provided for @featuredViewAll.
  ///
  /// In en, this message translates to:
  /// **'View all'**
  String get featuredViewAll;
}

class _AppLocalizationsDelegate
    extends LocalizationsDelegate<AppLocalizations> {
  const _AppLocalizationsDelegate();

  @override
  Future<AppLocalizations> load(Locale locale) {
    return SynchronousFuture<AppLocalizations>(lookupAppLocalizations(locale));
  }

  @override
  bool isSupported(Locale locale) =>
      <String>['en', 'ja', 'ko', 'zh'].contains(locale.languageCode);

  @override
  bool shouldReload(_AppLocalizationsDelegate old) => false;
}

AppLocalizations lookupAppLocalizations(Locale locale) {
  // Lookup logic when language+country codes are specified.
  switch (locale.languageCode) {
    case 'zh':
      {
        switch (locale.countryCode) {
          case 'CN':
            return AppLocalizationsZhCn();
          case 'TW':
            return AppLocalizationsZhTw();
        }
        break;
      }
  }

  // Lookup logic when only language code is specified.
  switch (locale.languageCode) {
    case 'en':
      return AppLocalizationsEn();
    case 'ja':
      return AppLocalizationsJa();
    case 'ko':
      return AppLocalizationsKo();
    case 'zh':
      return AppLocalizationsZh();
  }

  throw FlutterError(
    'AppLocalizations.delegate failed to load unsupported locale "$locale". This is likely '
    'an issue with the localizations generation tool. Please file an issue '
    'on GitHub with a reproducible sample app and the gen-l10n configuration '
    'that was used.',
  );
}

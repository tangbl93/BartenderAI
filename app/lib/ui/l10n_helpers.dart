import '../data/models/models.dart';
import '../l10n/app_localizations.dart';

/// Maps domain enums to localized labels so widgets stay declarative.
extension CategoryLabel on AppLocalizations {
  String categoryLabel(IngredientCategory category) {
    switch (category) {
      case IngredientCategory.baseSpirit:
        return fridgeCategoryBaseSpirit;
      case IngredientCategory.drink:
        return fridgeCategoryDrink;
      case IngredientCategory.fruit:
        return fridgeCategoryFruit;
      case IngredientCategory.snack:
        return fridgeCategorySnack;
    }
  }

  String posterDimensionLabel(PosterDimension dimension) {
    switch (dimension) {
      case PosterDimension.homeCloseup:
        return posterDimensionHomeCloseup;
      case PosterDimension.barCommercial:
        return posterDimensionBarCommercial;
      case PosterDimension.stepsLong:
        return posterDimensionStepsLong;
      case PosterDimension.custom:
        return posterDimensionHomeCloseup;
    }
  }

  String posterStatusLabel(PosterStatus status) {
    switch (status) {
      case PosterStatus.pending:
        return posterStatusPending;
      case PosterStatus.running:
        return posterStatusRunning;
      case PosterStatus.done:
        return posterStatusDone;
      case PosterStatus.failed:
        return posterStatusFailed;
    }
  }

  String labResultLabel(LabResult result) {
    return result == LabResult.success ? labResultSuccess : labResultFail;
  }

  String authErrorLabel(String? code) {
    switch (code) {
      case 'ACCOUNT_EXISTS':
        return authAccountExists;
      case 'INVALID_CREDENTIALS':
        return authInvalidCredentials;
      default:
        return commonError;
    }
  }
}

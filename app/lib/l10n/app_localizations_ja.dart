// ignore: unused_import
import 'package:intl/intl.dart' as intl;
import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for Japanese (`ja`).
class AppLocalizationsJa extends AppLocalizations {
  AppLocalizationsJa([String locale = 'ja']) : super(locale);

  @override
  String get commonAppName => 'AI バーテンダー';

  @override
  String get commonActionSave => '保存';

  @override
  String get commonActionShare => '共有';

  @override
  String get commonActionCancel => 'キャンセル';

  @override
  String get commonActionConfirm => '確認';

  @override
  String get commonActionRetry => '再試行';

  @override
  String get commonActionNext => '次へ';

  @override
  String get commonActionSkip => 'スキップ';

  @override
  String get commonActionDone => '完了';

  @override
  String get commonActionDelete => '削除';

  @override
  String get commonActionEdit => '編集';

  @override
  String get commonActionBack => '戻る';

  @override
  String get commonLoading => '読み込み中…';

  @override
  String get commonError => 'エラーが発生しました';

  @override
  String get commonLanguage => '言語';

  @override
  String get commonSettings => '設定';

  @override
  String get authLoginTitle => 'ログイン';

  @override
  String get authRegisterTitle => 'アカウント作成';

  @override
  String get authAccountLabel => 'メールまたは電話番号';

  @override
  String get authPasswordLabel => 'パスワード';

  @override
  String get authDisplayNameLabel => '表示名';

  @override
  String get authLoginButton => 'ログイン';

  @override
  String get authRegisterButton => '登録';

  @override
  String get authToRegister => 'アカウントがない？登録する';

  @override
  String get authToLogin => 'アカウントをお持ちですか？ログイン';

  @override
  String get authPasswordTooShort => 'パスワードは8文字以上必要です';

  @override
  String get authAccountRequired => 'アカウントを入力してください';

  @override
  String get authInvalidCredentials => 'アカウントまたはパスワードが正しくありません';

  @override
  String get authAccountExists => 'アカウントは既に存在します';

  @override
  String get authLogout => 'ログアウト';

  @override
  String get navFridge => '冷蔵庫';

  @override
  String get navWall => 'ウォール';

  @override
  String get navLab => 'ラボ';

  @override
  String get navProfile => 'マイページ';

  @override
  String get fridgeTitle => '冷蔵庫を開ける';

  @override
  String get fridgeSubtitle => '冷蔵庫にある材料にチェック';

  @override
  String get fridgeCategoryBaseSpirit => 'ベーススピリッツ';

  @override
  String get fridgeCategoryDrink => 'ドリンク';

  @override
  String get fridgeCategoryFruit => 'フルーツ';

  @override
  String get fridgeCategorySnack => 'スナック';

  @override
  String fridgeSelectedCount(int count) {
    return '$count 件選択中';
  }

  @override
  String get fridgeGenerate => 'レシピを生成';

  @override
  String get fridgeNeedMore => '飲めるレシピには材料を2つ以上選んでください';

  @override
  String get fridgeClear => 'クリア';

  @override
  String get exampleCardTitle => 'サンプルを試す';

  @override
  String get exampleCardSubtitle => 'タップしてサンプルレシピを見る';

  @override
  String get onboardingTitle => 'ようこそ';

  @override
  String get onboardingStepSelectIngredients => '冷蔵庫にある材料にチェック';

  @override
  String get onboardingStepGenerateRecipe => 'AI があなた専用のレシピを調合';

  @override
  String get onboardingStepGeneratePoster => 'ポスターマトリクスを生成して共有';

  @override
  String get onboardingStepCheckIn => 'ラボで作品をチェックイン';

  @override
  String get onboardingReplay => 'チュートリアルをもう一度';

  @override
  String get recipeResultTitle => 'あなたのレシピ';

  @override
  String recipeAlcoholRange(String range) {
    return 'アルコール度数：$range';
  }

  @override
  String get recipeIngredients => '材料';

  @override
  String get recipeSteps => '作り方';

  @override
  String get recipeToolSubstitutions => '家庭用ツールの代替';

  @override
  String get recipeSafetyNotes => '安全に関する注意';

  @override
  String get recipeResultAlcoholHint => '適量を飲みましょう。未成年の飲酒は禁止です。';

  @override
  String get recipeOptional => '任意';

  @override
  String get recipeGuideTitle => 'ていねいガイド';

  @override
  String get recipeMakePoster => 'ポスターを作成';

  @override
  String get recipeGenerating => 'レシピを調合中…';

  @override
  String get posterTitle => 'ポスターマトリクス';

  @override
  String get posterDimensionHomeCloseup => '自家製クローズアップ';

  @override
  String get posterDimensionBarCommercial => 'バー商業ポスター';

  @override
  String get posterDimensionStepsLong => '手順解説ロング画像';

  @override
  String get posterStatusPending => '待機中';

  @override
  String get posterStatusRunning => '生成中';

  @override
  String get posterStatusDone => '完了';

  @override
  String get posterStatusFailed => '失敗';

  @override
  String get posterSaveToGallery => 'ギャラリーに保存';

  @override
  String get posterSaveAll => 'すべて保存';

  @override
  String get posterSaved => 'ギャラリーに保存しました';

  @override
  String get posterGenerating => 'ポスターを生成中…';

  @override
  String get posterTimeout => '生成がタイムアウトしました。再試行してください';

  @override
  String get labTitle => 'マイ ほろよいラボ';

  @override
  String get labEmpty => 'まだチェックインがありません。一杯作ってチェックインしよう！';

  @override
  String get labCheckIn => 'チェックイン';

  @override
  String get labResultSuccess => '成功';

  @override
  String get labResultFail => '失敗';

  @override
  String get labPickImage => '写真を選択';

  @override
  String get labTakePhoto => '写真を撮る';

  @override
  String get labNoteLabel => 'メモ';

  @override
  String get labImageRequired => '写真を追加してください';

  @override
  String get labResultRequired => '成功か失敗かを選んでください';

  @override
  String get labSubmitToWall => 'ウォールに投稿';

  @override
  String get labSubmittedPending => '投稿しました。審査待ちです';

  @override
  String get labDetailTitle => '作品の詳細';

  @override
  String labCreatedAt(String date) {
    return '作成日 $date';
  }

  @override
  String get wallTitle => 'クリエイティブ ポスターウォール';

  @override
  String get wallSortHot => '人気';

  @override
  String get wallSortTime => '新着';

  @override
  String get wallEmpty => '承認済みのポスターはまだありません';

  @override
  String get moderationPrivate => '非公開';

  @override
  String get moderationPending => '審査待ち';

  @override
  String get moderationApproved => '承認済み';

  @override
  String get moderationRejected => '却下';
}

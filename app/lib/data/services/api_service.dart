import 'dart:convert';

import 'package:http/http.dart' as http;

import '../models/models.dart';

/// Thin HTTP client around the Home Bartender AI backend contract.
///
/// Used only when [AppConfig.useMock] is `false`. Endpoints mirror
/// docs/api/openapi.yaml. The bearer token is injected per-request.
class ApiService {
  ApiService({required this.baseUrl, http.Client? client})
      : _client = client ?? http.Client();

  final String baseUrl;
  final http.Client _client;

  String? _accessToken;

  // ignore: avoid_setters_without_getters
  set accessToken(String? token) => _accessToken = token;

  Map<String, String> _headers({bool json = true}) => {
        if (json) 'Content-Type': 'application/json',
        if (_accessToken != null) 'Authorization': 'Bearer $_accessToken',
      };

  Uri _uri(String path, [Map<String, dynamic>? query]) {
    return Uri.parse('$baseUrl$path').replace(
      queryParameters: query?.map((k, v) => MapEntry(k, '$v')),
    );
  }

  Never _throw(http.Response res) {
    Map<String, dynamic> body = const {};
    try {
      body = jsonDecode(res.body) as Map<String, dynamic>;
    } catch (_) {}
    throw ApiException(
      res.statusCode,
      body['message']?.toString() ?? 'HTTP ${res.statusCode}',
      body['code']?.toString(),
    );
  }

  // ---------------- AUTH ----------------
  Future<AuthResult> register(
      String account, String password, String? displayName) async {
    final res = await _client.post(
      _uri('/auth/register'),
      headers: _headers(),
      body: jsonEncode({
        'account': account,
        'password': password,
        'displayName': ?displayName,
      }),
    );
    if (res.statusCode != 201) _throw(res);
    return AuthResult.fromJson(jsonDecode(res.body) as Map<String, dynamic>);
  }

  Future<AuthResult> login(String account, String password) async {
    final res = await _client.post(
      _uri('/auth/login'),
      headers: _headers(),
      body: jsonEncode({'account': account, 'password': password}),
    );
    if (res.statusCode != 200) _throw(res);
    return AuthResult.fromJson(jsonDecode(res.body) as Map<String, dynamic>);
  }

  /// POST /auth/device — silent login by deviceId (Android = GAID).
  Future<AuthResult> deviceLogin(String deviceId,
      {String platform = 'android', String locale = 'en'}) async {
    final res = await _client.post(
      _uri('/auth/device'),
      headers: _headers(),
      body: jsonEncode({
        'deviceId': deviceId,
        'platform': platform,
        'locale': locale,
      }),
    );
    if (res.statusCode != 200) _throw(res);
    return AuthResult.fromJson(jsonDecode(res.body) as Map<String, dynamic>);
  }

  Future<void> logout() async {
    await _client.post(_uri('/auth/logout'), headers: _headers());
    _accessToken = null;
  }

  // ---------------- INGREDIENTS ----------------
  Future<List<Ingredient>> ingredients(String locale,
      {IngredientCategory? category}) async {
    final res = await _client.get(
      _uri('/ingredients', {
        'locale': locale,
        if (category != null) 'category': category.wire,
      }),
      headers: _headers(),
    );
    if (res.statusCode != 200) _throw(res);
    return (jsonDecode(res.body) as List)
        .map((e) => Ingredient.fromJson((e as Map).cast<String, dynamic>()))
        .toList();
  }

  // ---------------- RECIPES ----------------
  Future<Recipe> generateRecipe(List<String> ingredientIds, String locale) async {
    final res = await _client.post(
      _uri('/recipes/generate'),
      headers: _headers(),
      body: jsonEncode({'ingredientIds': ingredientIds, 'locale': locale}),
    );
    if (res.statusCode != 200) _throw(res);
    return Recipe.fromJson(jsonDecode(res.body) as Map<String, dynamic>);
  }

  Future<List<Recipe>> recipeExamples(String locale) async {
    final res = await _client.get(
      _uri('/recipes/examples', {'locale': locale}),
      headers: _headers(),
    );
    if (res.statusCode != 200) _throw(res);
    return (jsonDecode(res.body) as List)
        .map((e) => Recipe.fromJson((e as Map).cast<String, dynamic>()))
        .toList();
  }

  // ---------------- POSTERS ----------------
  Future<PosterJob> createPosterJob(String recipeId, String locale,
      {List<String>? templateIds}) async {
    final res = await _client.post(
      _uri('/posters/jobs'),
      headers: _headers(),
      body: jsonEncode({
        'recipeId': recipeId,
        'locale': locale,
        'templateIds': ?templateIds,
      }),
    );
    if (res.statusCode != 202) _throw(res);
    return PosterJob.fromJson(jsonDecode(res.body) as Map<String, dynamic>);
  }

  Future<PosterJob> posterJob(String id) async {
    final res = await _client.get(_uri('/posters/jobs/$id'), headers: _headers());
    if (res.statusCode != 200) _throw(res);
    return PosterJob.fromJson(jsonDecode(res.body) as Map<String, dynamic>);
  }

  Future<void> retryPoster(String posterId) async {
    final res =
        await _client.post(_uri('/posters/$posterId/retry'), headers: _headers());
    if (res.statusCode != 202) _throw(res);
  }

  // ---------------- TEMPLATES ----------------
  Future<List<StyleTemplate>> templates() async {
    final res = await _client.get(_uri('/templates'), headers: _headers());
    if (res.statusCode != 200) _throw(res);
    return (jsonDecode(res.body) as List)
        .map((e) => StyleTemplate.fromJson((e as Map).cast<String, dynamic>()))
        .toList();
  }

  // ---------------- LAB ----------------
  Future<List<LabEntry>> labEntries() async {
    final res = await _client.get(_uri('/lab/entries'), headers: _headers());
    if (res.statusCode != 200) _throw(res);
    return (jsonDecode(res.body) as List)
        .map((e) => LabEntry.fromJson((e as Map).cast<String, dynamic>()))
        .toList();
  }

  Future<LabEntry> createLabEntry(String recipeId, String posterImageUrl,
      {List<String>? photos, String? note}) async {
    final res = await _client.post(
      _uri('/lab/entries'),
      headers: _headers(),
      body: jsonEncode({
        'recipeId': recipeId,
        'posterImageUrl': posterImageUrl,
        'photos': photos ?? const <String>[],
        'note': ?note,
      }),
    );
    if (res.statusCode != 201) _throw(res);
    return LabEntry.fromJson(jsonDecode(res.body) as Map<String, dynamic>);
  }
}

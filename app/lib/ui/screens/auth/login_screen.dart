import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../../l10n/app_localizations.dart';
import '../../../logic/auth_controller.dart';
import '../../l10n_helpers.dart';
import '../../widgets/language_switcher.dart';

/// Combined login / register form. Validates input client-side and surfaces
/// backend errors (invalid credentials / account exists) via localized text.
class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _account = TextEditingController();
  final _password = TextEditingController();
  final _name = TextEditingController();
  bool _registerMode = false;

  @override
  void dispose() {
    _account.dispose();
    _password.dispose();
    _name.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    final t = AppLocalizations.of(context);
    if (!_formKey.currentState!.validate()) return;
    final auth = context.read<AuthController>();
    final ok = _registerMode
        ? await auth.register(_account.text.trim(), _password.text,
            _name.text.trim().isEmpty ? null : _name.text.trim())
        : await auth.login(_account.text.trim(), _password.text);
    if (!ok && mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(t.authErrorLabel(auth.error))),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final t = AppLocalizations.of(context);
    final auth = context.watch<AuthController>();

    return Scaffold(
      appBar: AppBar(
        title: Text(_registerMode ? t.authRegisterTitle : t.authLoginTitle),
        actions: const [LanguageSwitcher()],
      ),
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 420),
            child: Form(
              key: _formKey,
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(t.commonAppName,
                      style: Theme.of(context).textTheme.headlineMedium),
                  const SizedBox(height: 32),
                  TextFormField(
                    key: const Key('field_account'),
                    controller: _account,
                    decoration: InputDecoration(
                      labelText: t.authAccountLabel,
                      prefixIcon: const Icon(Icons.person),
                    ),
                    validator: (v) =>
                        (v == null || v.trim().isEmpty) ? t.authAccountRequired : null,
                  ),
                  const SizedBox(height: 16),
                  TextFormField(
                    key: const Key('field_password'),
                    controller: _password,
                    obscureText: true,
                    decoration: InputDecoration(
                      labelText: t.authPasswordLabel,
                      prefixIcon: const Icon(Icons.lock),
                    ),
                    validator: (v) =>
                        (v == null || v.length < 8) ? t.authPasswordTooShort : null,
                  ),
                  if (_registerMode) ...[
                    const SizedBox(height: 16),
                    TextFormField(
                      key: const Key('field_name'),
                      controller: _name,
                      decoration: InputDecoration(
                        labelText: t.authDisplayNameLabel,
                        prefixIcon: const Icon(Icons.badge),
                      ),
                    ),
                  ],
                  const SizedBox(height: 24),
                  SizedBox(
                    width: double.infinity,
                    child: FilledButton(
                      key: const Key('btn_submit'),
                      onPressed: auth.busy ? null : _submit,
                      child: auth.busy
                          ? const SizedBox(
                              height: 20,
                              width: 20,
                              child: CircularProgressIndicator(strokeWidth: 2),
                            )
                          : Text(_registerMode
                              ? t.authRegisterButton
                              : t.authLoginButton),
                    ),
                  ),
                  TextButton(
                    onPressed: () =>
                        setState(() => _registerMode = !_registerMode),
                    child:
                        Text(_registerMode ? t.authToLogin : t.authToRegister),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}

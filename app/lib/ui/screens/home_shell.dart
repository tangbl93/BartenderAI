import 'package:flutter/material.dart';

import '../../l10n/app_localizations.dart';
import 'fridge/fridge_screen.dart';
import 'lab/lab_screen.dart';
import 'profile/profile_screen.dart';
import 'wall/wall_screen.dart';

/// Bottom-navigation shell hosting the four primary front-end tabs.
class HomeShell extends StatefulWidget {
  const HomeShell({super.key});

  @override
  State<HomeShell> createState() => _HomeShellState();
}

class _HomeShellState extends State<HomeShell> {
  int _index = 0;

  static const _tabs = [
    FridgeScreen(),
    WallScreen(),
    LabScreen(),
    ProfileScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    final t = AppLocalizations.of(context);
    return Scaffold(
      body: IndexedStack(index: _index, children: _tabs),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _index,
        onDestinationSelected: (i) => setState(() => _index = i),
        destinations: [
          NavigationDestination(
            icon: const Icon(Icons.kitchen_outlined),
            selectedIcon: const Icon(Icons.kitchen),
            label: t.navFridge,
          ),
          NavigationDestination(
            icon: const Icon(Icons.dashboard_outlined),
            selectedIcon: const Icon(Icons.dashboard),
            label: t.navWall,
          ),
          NavigationDestination(
            icon: const Icon(Icons.science_outlined),
            selectedIcon: const Icon(Icons.science),
            label: t.navLab,
          ),
          NavigationDestination(
            icon: const Icon(Icons.person_outline),
            selectedIcon: const Icon(Icons.person),
            label: t.navProfile,
          ),
        ],
      ),
    );
  }
}

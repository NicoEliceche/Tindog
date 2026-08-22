import { useMemo } from 'react';
import { ActivityIndicator, Image, Text, View } from 'react-native';
import { useAppTheme } from '../../../core/providers/AppPreferencesProvider';
import { createStyles } from './BootstrapScreen.styles';

const logoSource = require('../../../../assets/tindog_patita_logo.png');

export function BootstrapScreen() {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.screen} accessibilityLabel="Tindog está iniciando">
      <View style={styles.logoFrame}>
        <Image
          source={logoSource}
          resizeMode="contain"
          style={styles.logo}
          accessibilityLabel="Logo de Tindog"
        />
        <View style={styles.wordmarkBand}>
          <Text style={styles.wordmark}>TINDOG</Text>
        </View>
      </View>

      <ActivityIndicator size="small" color={theme.colors.primary} />
      <Text style={styles.loadingText}>Conectando patitas...</Text>
    </View>
  );
}

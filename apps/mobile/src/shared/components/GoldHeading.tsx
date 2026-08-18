import MaskedView from '@react-native-masked-view/masked-view';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View, type StyleProp, type TextStyle } from 'react-native';
import { useAppTheme } from '../../core/providers/AppPreferencesProvider';

interface GoldHeadingProps {
  children: string;
  style?: StyleProp<TextStyle>;
  numberOfLines?: number;
}

/**
 * Título con el mismo dorado metalizado de la web.
 *
 * React Native no admite degradado dentro del texto, así que se dibuja el
 * degradado y se recorta con la forma del texto. Va por máscara y no por SVG
 * porque el texto sigue siendo un `Text` real: reacomoda solo, respeta el
 * tamaño de fuente del sistema y no hay que fijarle alto ni ancho.
 */
export function GoldHeading({ children, style, numberOfLines }: GoldHeadingProps) {
  const theme = useAppTheme();

  return (
    <MaskedView
      maskElement={(
        <Text style={[style, styles.mask]} numberOfLines={numberOfLines}>
          {children}
        </Text>
      )}
    >
      {/* Sólo aporta el color: el texto visible es el de la máscara. */}
      <LinearGradient
        colors={theme.gradients.metalGoldHeading}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={[style, styles.spacer]} numberOfLines={numberOfLines}>
          {children}
        </Text>
      </LinearGradient>
    </MaskedView>
  );
}

const styles = StyleSheet.create({
  // La máscara usa el canal alfa: el texto tiene que ser opaco para que el
  // degradado se vea entero.
  mask: { backgroundColor: 'transparent' },
  // Reserva el tamaño real del título sin pintarse.
  spacer: { opacity: 0 },
});

import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Link } from 'expo-router';
import { useAuthStore } from '../../store/authStore';
import { colors, fonts, fontSizes, radii, spacing, stickerShadow, cardBorder } from '../../theme/theme';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const signIn = useAuthStore((s) => s.signIn);

  const onSubmit = async () => {
    if (!email || !password) {
      Alert.alert('Missing info', 'Enter your email and password to continue.');
      return;
    }
    setSubmitting(true);
    try {
      await signIn(email.trim(), password);
    } catch (e: any) {
      Alert.alert('Could not sign in', e.message ?? 'Check your details and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.badge}>
        <Text style={styles.badgeEmoji}>🗓️</Text>
      </View>

      <Text style={styles.title}>Welcome back</Text>
      <Text style={styles.subtitle}>Plan your day. Win your day.</Text>

      <View style={styles.form}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="you@example.com"
          placeholderTextColor={colors.textMuted}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          placeholder="••••••••"
          placeholderTextColor={colors.textMuted}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <Pressable
          style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
          onPress={onSubmit}
          disabled={submitting}
        >
          <Text style={styles.primaryButtonText}>
            {submitting ? 'Signing in…' : 'Sign in'}
          </Text>
        </Pressable>

        <Link href="/(auth)/register" asChild>
          <Pressable style={styles.linkRow}>
            <Text style={styles.linkText}>
              New here? <Text style={styles.linkTextStrong}>Create an account</Text>
            </Text>
          </Pressable>
        </Link>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bgDeep,
    alignItems: 'center',
    paddingTop: 88,
    paddingHorizontal: spacing.xl,
  },
  badge: {
    width: 84,
    height: 84,
    borderRadius: radii.lg,
    backgroundColor: colors.yellow,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
    ...cardBorder,
    ...stickerShadow(5),
  },
  badgeEmoji: { fontSize: 40 },
  title: {
    fontFamily: fonts.displayBold,
    fontSize: fontSizes.xxl,
    color: colors.textOnDark,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: fontSizes.md,
    color: colors.textMuted,
    marginTop: spacing.xs,
    marginBottom: spacing.xxl,
  },
  form: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.xl,
    ...cardBorder,
    ...stickerShadow(5),
  },
  label: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSizes.sm,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
    marginTop: spacing.md,
  },
  input: {
    borderWidth: 2,
    borderColor: colors.divider,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontFamily: fonts.body,
    fontSize: fontSizes.md,
    color: colors.textPrimary,
    backgroundColor: colors.bg,
  },
  primaryButton: {
    marginTop: spacing.xl,
    backgroundColor: colors.primary,
    borderRadius: radii.pill,
    paddingVertical: spacing.md,
    alignItems: 'center',
    ...cardBorder,
    ...stickerShadow(4),
  },
  pressed: { transform: [{ translateY: 2 }], shadowOffset: { width: 0, height: 2 } },
  primaryButtonText: {
    fontFamily: fonts.display,
    fontSize: fontSizes.lg,
    color: colors.textOnDark,
  },
  linkRow: { marginTop: spacing.lg, alignItems: 'center' },
  linkText: { fontFamily: fonts.body, color: colors.textSecondary, fontSize: fontSizes.sm },
  linkTextStrong: { fontFamily: fonts.bodySemiBold, color: colors.primary },
});

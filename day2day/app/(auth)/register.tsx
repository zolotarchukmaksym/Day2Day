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

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const signUp = useAuthStore((s) => s.signUp);

  const onSubmit = async () => {
    if (!email || !password) {
      Alert.alert('Missing info', 'Enter an email and password to continue.');
      return;
    }
    if (password !== confirm) {
      Alert.alert('Passwords don\u2019t match', 'Double-check both password fields.');
      return;
    }
    setSubmitting(true);
    try {
      await signUp(email.trim(), password);
      Alert.alert('Almost there', 'Check your email to confirm your account.');
    } catch (e: any) {
      Alert.alert('Could not sign up', e.message ?? 'Try again in a moment.');
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
        <Text style={styles.badgeEmoji}>✨</Text>
      </View>

      <Text style={styles.title}>Create your account</Text>
      <Text style={styles.subtitle}>Takes less than a minute.</Text>

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
          placeholder="At least 6 characters"
          placeholderTextColor={colors.textMuted}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <Text style={styles.label}>Confirm password</Text>
        <TextInput
          style={styles.input}
          placeholder="••••••••"
          placeholderTextColor={colors.textMuted}
          value={confirm}
          onChangeText={setConfirm}
          secureTextEntry
        />

        <Pressable
          style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
          onPress={onSubmit}
          disabled={submitting}
        >
          <Text style={styles.primaryButtonText}>
            {submitting ? 'Creating account…' : 'Create account'}
          </Text>
        </Pressable>

        <Link href="/(auth)/login" asChild>
          <Pressable style={styles.linkRow}>
            <Text style={styles.linkText}>
              Already have an account? <Text style={styles.linkTextStrong}>Sign in</Text>
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
    paddingTop: 72,
    paddingHorizontal: spacing.xl,
  },
  badge: {
    width: 84,
    height: 84,
    borderRadius: radii.lg,
    backgroundColor: colors.sky,
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
    textAlign: 'center',
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
    backgroundColor: colors.coral,
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

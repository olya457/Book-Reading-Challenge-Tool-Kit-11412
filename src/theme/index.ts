import { Platform, StyleSheet } from 'react-native';

export const colors = {
  background: '#0D0914',
  card: '#1B1329',
  raised: '#2C1C40',
  border: '#332344',
  text: '#F4EDFF',
  muted: '#B4A4CD',
  faint: '#79698F',
  gold: '#F6C629',
  orange: '#DE8500',
  purple: '#8B32F0',
  green: '#008866',
};
export const floatingTabBar = {
  bottom: 20,
  height: 68,
  horizontalInset: 16,
  contentInset: 108,
};

export const serif = Platform.select({ ios: 'Georgia', android: 'serif' });
export const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.background },
  content: {
    padding: 20,
    paddingBottom: 28,
    gap: 16,
    flexGrow: 1,
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center',
  },
  title: {
    fontFamily: serif,
    fontSize: 29,
    fontWeight: '700',
    color: colors.text,
  },
  heading: {
    fontFamily: serif,
    fontSize: 23,
    fontWeight: '700',
    color: colors.text,
  },
  body: { fontSize: 14, lineHeight: 22, color: colors.muted },
  label: {
    fontSize: 10,
    letterSpacing: 1.1,
    fontWeight: '600',
    color: colors.faint,
  },
  card: {
    padding: 18,
    borderRadius: 19,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 12,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  center: { alignItems: 'center', gap: 14 },
  input: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 13,
    padding: 15,
    color: colors.text,
    fontSize: 20,
    fontWeight: '600',
    minHeight: 52,
  },
});

import { useResponsiveLayout } from '../hooks/useResponsiveLayout';
import React, { useMemo, useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import { Button, Chip, Header, Host, Screen } from '../components/UI';
import { useStorage } from '../storage/AppStorage';
import { readingPlan } from '../utils/reading';
import { colors, styles as s } from '../theme';
export function CalculatorScreen() {
  const layout = useResponsiveLayout();
  const { state, update } = useStorage();
  const draft = state.calculator;
  const [showPlan, setShowPlan] = useState(false);
  const [custom, setCustom] = useState(
    () =>
      !(
        draft.mode === 'pages'
          ? ['10', '20', '30', '50']
          : ['3', '7', '14', '30']
      ).includes(draft.amount),
  );
  const [visibleDays, setVisibleDays] = useState(30);
  const change = (value: Partial<typeof draft>) =>
    update(current => ({
      ...current,
      calculator: { ...current.calculator, ...value },
    }));
  const total = Number(draft.total),
    current = Number(draft.current),
    amount = Number(draft.amount);
  const valid =
    draft.total !== '' &&
    draft.current !== '' &&
    total > 0 &&
    total <= 100000 &&
    current >= 0 &&
    current <= total;
  const amountValid = amount > 0 && amount <= 10000;
  const plan = useMemo(
    () => readingPlan(total, current, draft.mode, amount),
    [total, current, draft.mode, amount],
  );
  const remaining = total - current;
  const invalid = draft.total && draft.current && !valid;
  const input = (key: 'total' | 'current', label: string) => (
    <View style={{ flex: 1, gap: 9 }}>
      <Text style={s.label}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        style={s.input}
        keyboardType="number-pad"
        maxLength={6}
        placeholder={key === 'total' ? 'Total pages' : 'Page now'}
        placeholderTextColor={colors.faint}
        value={draft[key]}
        onChangeText={text => change({ [key]: text.replace(/\D/g, '') })}
      />
    </View>
  );
  return (
    <Screen>
      <Header
        title={'Reading Finish\nCalculator'}
        subtitle="Plan your reading to the finish line."
        pose="calculator"
      />
      <View
        style={[
          s.row,
          layout.singleColumn && {
            flexDirection: 'column',
            alignItems: 'stretch',
          },
        ]}
      >
        {input('total', 'TOTAL PAGES')}
        {input('current', 'CURRENT PAGE')}
      </View>
      {!!invalid && (
        <Text accessibilityRole="alert" style={{ color: '#F397A9' }}>
          Enter 1–100,000 total pages and a current page between 0 and the
          total.
        </Text>
      )}
      {!valid ? (
        <View
          style={{ flex: 1, justifyContent: 'center', gap: 16, paddingTop: 30 }}
        >
          <Host pose="calculator" height={300} />
          <Text style={[s.body, { textAlign: 'center' }]}>
            Enter your book’s total pages and current page to calculate your
            personalized reading plan.
          </Text>
        </View>
      ) : (
        <>
          <View style={s.card}>
            <View style={[s.row, { justifyContent: 'space-between' }]}>
              <View>
                <Text
                  style={{
                    color: colors.gold,
                    fontWeight: '800',
                    fontSize: 29,
                  }}
                >
                  {Math.floor((current / total) * 100)}%
                </Text>
                <Text style={s.label}>complete</Text>
              </View>
              <View>
                <Text style={[s.heading, { textAlign: 'right' }]}>
                  {remaining}
                </Text>
                <Text style={s.label}>pages remaining</Text>
              </View>
            </View>
            <View
              style={{
                height: 8,
                borderRadius: 5,
                backgroundColor: colors.border,
                overflow: 'hidden',
              }}
            >
              <View
                style={{
                  height: 8,
                  width: `${(current / total) * 100}%`,
                  backgroundColor: colors.gold,
                  borderRadius: 5,
                }}
              />
            </View>
            <View style={[s.row, { justifyContent: 'space-between' }]}>
              <Text style={s.label}>Page {current}</Text>
              <Text style={s.label}>Page {total}</Text>
            </View>
            <Text style={s.body}>
              📖 {current} / {total} pages read
            </Text>
          </View>
          {remaining === 0 ? (
            <View style={s.card}>
              <Text style={[s.heading, { color: colors.gold }]}>
                You reached the final page!
              </Text>
              <Text style={s.body}>
                Your book is complete. Ready for a new adventure?
              </Text>
            </View>
          ) : (
            <>
              <View style={[s.card, s.row, { padding: 6 }]}>
                <View style={{ flex: 1 }}>
                  <Chip
                    title="Pages Per Day"
                    selected={draft.mode === 'pages'}
                    onPress={() => {
                      change({ mode: 'pages', amount: '20' });
                      setCustom(false);
                    }}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Chip
                    title="Finish In"
                    selected={draft.mode === 'days'}
                    onPress={() => {
                      change({ mode: 'days', amount: '7' });
                      setCustom(false);
                    }}
                  />
                </View>
              </View>
              <Text style={s.label}>
                {draft.mode === 'pages' ? 'PAGES PER DAY' : 'FINISH IN'}
              </Text>
              <View style={s.wrap}>
                {(draft.mode === 'pages'
                  ? [10, 20, 30, 50]
                  : [3, 7, 14, 30]
                ).map(value => (
                  <Chip
                    key={value}
                    title={`${value}${draft.mode === 'days' ? ' days' : ''}`}
                    selected={!custom && amount === value}
                    onPress={() => {
                      change({ amount: String(value) });
                      setCustom(false);
                    }}
                  />
                ))}
                <Chip
                  title="Custom"
                  selected={custom}
                  onPress={() => {
                    setCustom(true);
                    change({ amount: '' });
                  }}
                />
              </View>
              {custom && (
                <TextInput
                  accessibilityLabel={
                    draft.mode === 'pages'
                      ? 'Custom pages per day'
                      : 'Custom days'
                  }
                  style={s.input}
                  keyboardType="number-pad"
                  value={draft.amount}
                  maxLength={5}
                  placeholder={
                    draft.mode === 'pages' ? 'Pages per day' : 'Number of days'
                  }
                  placeholderTextColor={colors.faint}
                  onChangeText={text =>
                    change({ amount: text.replace(/\D/g, '') })
                  }
                />
              )}
              {!amountValid ? (
                <Text style={s.body}>Enter a value between 1 and 10,000.</Text>
              ) : (
                <>
                  <View style={[s.card, { backgroundColor: colors.raised }]}>
                    <View
                      style={[
                        s.row,
                        layout.singleColumn && {
                          flexDirection: 'column',
                          alignItems: 'stretch',
                        },
                      ]}
                    >
                      <View
                        style={[
                          s.card,
                          {
                            flex: 1,
                            alignItems: 'center',
                            backgroundColor: '#3B2B31',
                          },
                        ]}
                      >
                        <Text style={[s.title, { color: colors.gold }]}>
                          {draft.mode === 'days'
                            ? Math.ceil(remaining / Math.min(amount, remaining))
                            : Math.min(amount, remaining)}
                        </Text>
                        <Text style={s.label}>pages per day</Text>
                      </View>
                      <View style={[s.card, { flex: 1, alignItems: 'center' }]}>
                        <Text style={[s.title, { color: '#D1A8F0' }]}>
                          {plan.length}
                        </Text>
                        <Text style={s.label}>days to finish</Text>
                      </View>
                    </View>
                    <Text style={s.body}>Pages remaining: {remaining}</Text>
                    <Text style={s.body}>
                      Est. reading time: ~
                      {((remaining * draft.speed) / 60).toFixed(1)}h
                    </Text>
                    {draft.mode === 'days' && amount > remaining && (
                      <Text style={s.body}>
                        At one page per day, you can finish in {remaining} days.
                      </Text>
                    )}
                  </View>
                  <View style={s.card}>
                    <Text style={s.label}>
                      READING SPEED (for time estimate)
                    </Text>
                    <View style={s.wrap}>
                      {[
                        { name: 'Relaxed', rate: 3 },
                        { name: 'Average', rate: 2 },
                        { name: 'Fast', rate: 1 },
                      ].map(speed => (
                        <Chip
                          key={speed.name}
                          title={speed.name}
                          selected={draft.speed === speed.rate}
                          onPress={() => change({ speed: speed.rate })}
                        />
                      ))}
                    </View>
                    <Text style={{ color: colors.faint, fontSize: 11 }}>
                      Approximate estimate only — actual time varies by book
                      complexity.
                    </Text>
                  </View>
                  <Button
                    title={
                      showPlan
                        ? 'Hide Reading Plan'
                        : `View ${plan.length}-Day Reading Plan`
                    }
                    secondary
                    onPress={() => setShowPlan(!showPlan)}
                  />
                  {showPlan && (
                    <View style={s.card}>
                      <Text style={{ color: colors.gold, fontWeight: '700' }}>
                        {plan.length}-Day Reading Plan
                      </Text>
                      {plan.slice(0, visibleDays).map(day => (
                        <View
                          key={day.day}
                          style={[
                            s.row,
                            {
                              paddingVertical: 9,
                              borderBottomWidth: 1,
                              borderBottomColor: colors.border,
                            },
                          ]}
                        >
                          <Chip title={`${day.day}`} />
                          <View style={{ flex: 1 }}>
                            <Text style={{ color: colors.text }}>
                              Day {day.day}
                            </Text>
                            <Text style={{ color: colors.faint, fontSize: 12 }}>
                              Pages {day.from}–{day.to}
                            </Text>
                          </View>
                          <Text style={{ color: colors.gold }}>
                            {day.pages} pages
                          </Text>
                        </View>
                      ))}
                      {visibleDays < plan.length && (
                        <Button
                          title="Show More Days"
                          secondary
                          onPress={() => setVisibleDays(value => value + 30)}
                        />
                      )}
                    </View>
                  )}
                </>
              )}
            </>
          )}
          <Button
            title="New Calculation"
            subtle
            onPress={() => {
              change({
                total: '',
                current: '',
                amount: '20',
                mode: 'pages',
                speed: 2,
              });
              setShowPlan(false);
              setCustom(false);
              setVisibleDays(30);
            }}
          />
        </>
      )}
    </Screen>
  );
}

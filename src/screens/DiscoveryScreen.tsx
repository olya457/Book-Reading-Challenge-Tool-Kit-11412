import { useResponsiveLayout } from '../hooks/useResponsiveLayout';
import { useScreenBack } from '../hooks/useScreenBack';
import React, { useRef, useState } from 'react';
import { Text, View } from 'react-native';
import {
  Back,
  Bookshelf,
  Button,
  Chip,
  CategoryRow,
  Header,
  Host,
  Screen,
} from '../components/UI';
import { Wheel, WheelHandle } from '../components/Wheel';
import { criteria, genres } from '../data/discovery';
import { useStorage } from '../storage/AppStorage';
import { pick } from '../utils/reading';
import { colors, styles as s } from '../theme';

export function DiscoveryScreen() {
  const wheel = useRef<WheelHandle>(null);
  const [spinning, setSpinning] = useState(false);
  const layout = useResponsiveLayout();
  const { state, update } = useStorage();
  const [view, setView] = useState<'home' | 'genre' | 'result'>(
    state.discovery ? (state.discovery.length ? 'result' : 'genre') : 'home',
  );
  useScreenBack(view !== 'home', () => setView('home'));
  const result = state.discovery;
  const genre = genres.find(item => item.name === result?.genre);
  const choose = (name: string) => {
    update(value => ({ ...value, discovery: { genre: name } }));
    setView('genre');
  };
  const randomize = (all: boolean, selectedGenre?: string) => {
    update(value => ({
      ...value,
      discovery: {
        genre:
          selectedGenre ||
          (all
            ? pick(genres).name
            : value.discovery?.genre || pick(genres).name),
        length: pick(criteria.length),
        era: pick(criteria.era),
        mood: pick(criteria.mood),
        setting: pick(criteria.setting),
      },
    }));
    setView('result');
  };
  if (view === 'genre' && result) {
    return (
      <Screen transitionKey={`${view}-${JSON.stringify(result)}`}>
        <Back title="Spin Again" onPress={() => setView('home')} />
        <View style={[s.center, { paddingTop: 24 }]}>
          <Text style={s.label}>YOUR NEXT GENRE</Text>
          <Text
            style={[
              s.title,
              { color: colors.gold, fontSize: 40, textAlign: 'center' },
            ]}
          >
            {result.genre}
          </Text>
          <Text style={[s.body, { textAlign: 'center' }]}>
            {genre?.description}
          </Text>
        </View>
        <Host height={280} />
        <View style={s.card}>
          <Text style={s.body}>Want more detail? Add random criteria:</Text>
          <View style={s.wrap}>
            {['Length', 'Era', 'Mood', 'Setting'].map(item => (
              <Chip key={item} title={item} />
            ))}
          </View>
        </View>
        <Button title="Add Random Criteria" onPress={() => randomize(false)} />
        <Button title="Spin Again" secondary onPress={() => setView('home')} />
      </Screen>
    );
  }
  if (view === 'result' && result) {
    return (
      <Screen transitionKey={`${view}-${JSON.stringify(result)}`}>
        <Back onPress={() => setView('home')} />
        <Text style={[s.label, { textAlign: 'center', marginTop: 20 }]}>
          YOUR NEXT BOOK
        </Text>
        <Text style={[s.title, { textAlign: 'center' }]}>Book Discovery</Text>
        <View style={[s.card, { backgroundColor: colors.raised, gap: 18 }]}>
          <Text style={[s.heading, { color: colors.gold }]}>
            📚 {result.genre}
          </Text>
          <Text style={s.body}>{genre?.description}</Text>
          <View style={s.wrap}>
            {(['length', 'era', 'mood', 'setting'] as const).map(key => (
              <View
                key={key}
                style={[
                  s.card,
                  {
                    width: layout.singleColumn ? '100%' : '48%',
                    flexGrow: 1,
                    padding: 12,
                  },
                ]}
              >
                <Text style={s.label}>{key.toUpperCase()}</Text>
                <Text
                  style={{
                    color: colors.text,
                    fontWeight: '600',
                    fontSize: 13,
                  }}
                >
                  {result[key]}
                </Text>
              </View>
            ))}
          </View>
          <View
            style={[
              s.card,
              { backgroundColor: '#3C3033', borderColor: '#665226' },
            ]}
          >
            <Text style={[s.label, { color: colors.gold }]}>
              YOUR RECOMMENDATION
            </Text>
            <Text style={[s.body, { fontStyle: 'italic', color: colors.text }]}>
              Try a {result.length?.split(' (')[0].toLowerCase()}{' '}
              {result.genre.toLowerCase()} book from {result.era}, with a{' '}
              {result.mood?.toLowerCase()} tone, set in{' '}
              {result.setting?.toLowerCase()}.
            </Text>
          </View>
        </View>
        <View style={[s.card, s.row]}>
          <View style={{ width: 70 }}>
            <Host height={140} />
          </View>
          <Text style={[s.body, { flex: 1 }]}>
            Use these criteria when browsing your bookshelf, a library, or a
            bookstore to find your next perfect read.
          </Text>
        </View>
        <Button title="Randomize Everything" onPress={() => randomize(true)} />
        <Button
          title="Generate Again"
          secondary
          onPress={() => randomize(false)}
        />
        <Button
          title="Change Genre"
          secondary
          onPress={() => setView('home')}
        />
      </Screen>
    );
  }
  return (
    <Screen transitionKey={`${view}-${JSON.stringify(result)}`}>
      <Header
        title={'Book Discovery\nWheel'}
        subtitle="Spin for your next book direction."
        pose="welcome"
      />
      <Wheel
        ref={wheel}
        items={genres.map(item => item.name)}
        onResult={choose}
        onSpinningChange={setSpinning}
      />
      <Button
        title={spinning ? 'Spinning…' : 'ϟ Quick Discovery'}
        disabled={spinning}
        onPress={() => wheel.current?.spin(name => randomize(true, name))}
      />
      <Text style={[s.body, { textAlign: 'center', fontSize: 12 }]}>
        Spin for a genre and a complete recommendation
      </Text>
      <Text style={s.label}>ALL GENRES</Text>
      <CategoryRow>
        {genres.map(item => (
          <Chip
            key={item.name}
            title={item.name}
            onPress={spinning ? undefined : () => choose(item.name)}
          />
        ))}
      </CategoryRow>
      <View style={s.card}>
        <Text style={[s.label, { textAlign: 'center' }]}>
          LITERARY UNIVERSE
        </Text>
        <Bookshelf />
      </View>
      <View style={s.card}>
        <Text style={{ color: colors.gold, fontWeight: '700' }}>
          What gets randomized?
        </Text>
        <View style={s.wrap}>
          {[
            ['🎭 Genre', '16 genres'],
            ['📏 Length', 'Short / Medium / Long'],
            ['🕰 Era', '5 time periods'],
            ['✨ Mood', '9 atmospheres'],
            ['🗺 Setting', '8 environments'],
          ].map(([title, detail]) => (
            <View
              key={title}
              style={{
                width: layout.singleColumn ? '100%' : '47%',
                gap: 5,
                paddingVertical: 5,
              }}
            >
              <Text style={{ color: colors.text }}>{title}</Text>
              <Text style={{ color: colors.faint, fontSize: 12 }}>
                {detail}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </Screen>
  );
}

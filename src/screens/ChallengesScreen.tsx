import { useResponsiveLayout } from '../hooks/useResponsiveLayout';
import { useScreenBack } from '../hooks/useScreenBack';
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {
  Back,
  Button,
  Chip,
  CategoryRow,
  Complete,
  Header,
  Host,
  Ring,
  Screen,
  Tile,
} from '../components/UI';
import { Wheel } from '../components/Wheel';
import {
  categories,
  Challenge,
  challenges,
  generate,
  packChallenges,
  packs,
} from '../data/challenges';
import { useStorage } from '../storage/AppStorage';
import { useTimer } from '../hooks/useTimer';
import { clock } from '../utils/reading';
import { colors, styles as s } from '../theme';

export function ChallengesScreen() {
  const layout = useResponsiveLayout();
  const { state, update, complete } = useStorage();
  const timer = useTimer('challenge');
  const [view, setView] = useState<
    'home' | 'card' | 'active' | 'wheel' | 'packs' | 'pack' | 'complete'
  >(state.activeChallenge ? 'active' : 'home');
  const [challenge, setChallenge] = useState<Challenge>(
    () => challenges.find(c => c.id === state.activeChallenge) || challenges[0],
  );
  useScreenBack(view !== 'home', () => setView('home'));
  const [category, setCategory] = useState<string>();
  const [pack, setPack] = useState<string>();
  const [wheelResult, setWheelResult] = useState(false);
  const show = (value: Challenge, fromWheel = false) => {
    setChallenge(value);
    setWheelResult(fromWheel);
    setView('card');
  };
  const finish = useCallback(() => {
    complete({
      id: timer.timer?.id || `challenge-${challenge.id}-${Date.now()}`,
      kind: 'challenge',
      title: challenge.title,
      seconds: timer.timer ? timer.timer.duration - timer.remaining : 0,
      date: new Date().toISOString(),
    });
    timer.clear();
    update(value => ({ ...value, activeChallenge: null }));
    setView('complete');
  }, [challenge, complete, timer, update]);
  useEffect(() => {
    if (view === 'active' && timer.timer && timer.remaining === 0) {
      finish();
    }
  }, [view, timer.timer, timer.remaining, finish]);
  const start = () => {
    const begin = () => {
      timer.clear();
      update(value => ({ ...value, activeChallenge: challenge.id }));
      if (challenge.seconds) {
        timer.start(challenge.seconds);
      }
      setView('active');
    };
    if (state.activeChallenge) {
      Alert.alert(
        'Replace current challenge?',
        'Your unfinished challenge will be replaced.',
        [
          { text: 'Keep Current', style: 'cancel' },
          { text: 'Start New', onPress: begin },
        ],
      );
    } else {
      begin();
    }
  };
  if (view === 'complete') {
    return (
      <Complete
        title="Challenge Complete!"
        subtitle={challenge.title}
        primary="New Challenge"
        onPrimary={() => show(generate())}
        onBack={() => setView('home')}
        backTitle="Back to Challenges"
      />
    );
  }
  if (view === 'active') {
    return (
      <Screen transitionKey={`${view}-${challenge.id}-${pack || ''}`}>
        <Back onPress={() => setView('home')} />
        <Chip title="● ACTIVE CHALLENGE" />
        <Text style={s.heading}>{challenge.title}</Text>
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            minHeight: layout.timerHeight,
            gap: 22,
          }}
        >
          {timer.timer ? (
            <Ring
              progress={timer.remaining / timer.timer.duration}
              text={clock(timer.remaining)}
              caption={timer.running ? 'remaining' : 'paused'}
            />
          ) : (
            <>
              <Host pose="reading" height={320} />
              <Text style={[s.body, { textAlign: 'center' }]}>
                Enjoy your book. Complete your challenge when you are ready.
              </Text>
            </>
          )}
        </View>
        {timer.timer && (
          <Button
            secondary
            title={timer.running ? 'Pause' : 'Resume'}
            onPress={timer.running ? timer.pause : timer.resume}
          />
        )}
        <Button title="Complete Challenge ✓" onPress={finish} />
      </Screen>
    );
  }
  if (view === 'card') {
    return (
      <Screen transitionKey={`${view}-${challenge.id}-${pack || ''}`}>
        <Back
          title={wheelResult ? 'Spin Again' : 'Back'}
          onPress={() =>
            setView(wheelResult ? 'wheel' : pack ? 'pack' : 'home')
          }
        />
        {wheelResult && (
          <Text style={[s.heading, { textAlign: 'center' }]}>
            Your Challenge
          </Text>
        )}
        <LinearGradient
          colors={['#F7CE37', '#DB8100']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ padding: 24, borderRadius: 22, gap: 15 }}
        >
          <Text style={[s.label, { color: '#6C4709' }]}>
            {challenge.category.toUpperCase()} CHALLENGE
          </Text>
          <Text style={{ fontSize: 23, fontWeight: '800', color: '#211307' }}>
            {challenge.title}
          </Text>
          <Text style={{ color: '#624313', fontSize: 12 }}>
            {challenge.difficulty} · {challenge.estimate}
          </Text>
        </LinearGradient>
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <Host pose="challenge" height={330} />
        </View>
        <Button title="Start Challenge" onPress={start} />
        <Button
          title={wheelResult ? 'Spin Again' : 'Generate Another'}
          secondary
          onPress={() =>
            wheelResult ? setView('wheel') : show(generate(category, pack))
          }
        />
      </Screen>
    );
  }
  if (view === 'wheel') {
    return (
      <Screen transitionKey={`${view}-${challenge.id}-${pack || ''}`}>
        <Back onPress={() => setView('home')} />
        <Text style={[s.heading, { textAlign: 'center' }]}>
          Challenge Wheel
        </Text>
        <Text style={[s.body, { textAlign: 'center' }]}>
          Spin to discover your challenge category
        </Text>
        <Wheel
          items={[
            'Pages',
            'Time',
            'Genre',
            'Classic',
            'Random Book',
            'Reading Place',
            'Weekend',
            'Surprise',
          ]}
          onResult={value =>
            show(
              generate(
                value === 'Random Book'
                  ? 'Book Choice'
                  : value === 'Reading Place'
                  ? 'Experience'
                  : value === 'Surprise'
                  ? undefined
                  : value,
              ),
              true,
            )
          }
        />
        <Text style={s.label}>SEGMENTS</Text>
        <View style={s.wrap}>
          {[
            'Pages',
            'Time',
            'Genre',
            'Classic',
            'Random Book',
            'Reading Place',
            'Weekend',
            'Surprise',
          ].map(value => (
            <Chip key={value} title={value} />
          ))}
        </View>
      </Screen>
    );
  }
  if (view === 'packs') {
    return (
      <Screen transitionKey={`${view}-${challenge.id}-${pack || ''}`}>
        <Back onPress={() => setView('home')} />
        <Text style={s.title}>Challenge Packs</Text>
        <Text style={s.body}>Curated collections for every reader</Text>
        {packs.map(item => (
          <Tile
            key={item.name}
            title={item.name}
            subtitle={item.description}
            icon={item.icon}
            detail={`${packChallenges(item.name).length} challenges`}
            onPress={() => {
              setPack(item.name);
              setView('pack');
            }}
          />
        ))}
      </Screen>
    );
  }
  if (view === 'pack') {
    return (
      <Screen transitionKey={`${view}-${challenge.id}-${pack || ''}`}>
        <Back onPress={() => setView('packs')} />
        <Text style={s.title}>{pack}</Text>
        <Button
          title="Generate from this Pack"
          onPress={() => show(generate(undefined, pack))}
        />
        {packChallenges(pack || '').map(item => (
          <Tile
            key={item.id}
            title={item.title}
            subtitle={`${item.category} · ${item.estimate}`}
            icon="📖"
            onPress={() => show(item)}
          />
        ))}
      </Screen>
    );
  }
  return (
    <Screen transitionKey={`${view}-${challenge.id}-${pack || ''}`}>
      <Header
        title={'Book Challenge\nGenerator'}
        subtitle="Get a new reading challenge in one tap."
        pose="challenge"
      />
      {state.activeChallenge && (
        <Button
          title="Resume Active Challenge"
          secondary
          onPress={() => {
            setChallenge(
              challenges.find(c => c.id === state.activeChallenge) ||
                challenges[0],
            );
            setView('active');
          }}
        />
      )}
      <Button
        title="✦ Generate Challenge"
        onPress={() => {
          setPack(undefined);
          show(generate(category));
        }}
      />
      <CategoryRow>
        {categories.map(item => (
          <Chip
            key={item}
            title={item}
            selected={category === item}
            onPress={() => setCategory(category === item ? undefined : item)}
          />
        ))}
      </CategoryRow>
      <Tile
        title="Challenge Wheel"
        subtitle="Spin to discover your challenge category"
        icon="🔮"
        onPress={() => {
          setPack(undefined);
          setView('wheel');
        }}
      />
      <Tile
        title="Challenge Packs"
        subtitle="Curated collections for every reading mood"
        icon="📚"
        onPress={() => setView('packs')}
      />
      <Tile
        title="Quick Challenge"
        subtitle="An instant random challenge. No selection needed."
        icon="⚡"
        onPress={() => {
          setPack('Quick Challenges');
          show(generate(undefined, 'Quick Challenges'));
        }}
      />
      <View style={s.card}>
        <Text style={s.label}>YOUR COMPLETED CHALLENGES</Text>
        <Text style={[s.heading, { color: colors.gold }]}>
          {state.history.filter(item => item.kind === 'challenge').length}
        </Text>
        <Text style={s.body}>Every page is a little adventure.</Text>
      </View>
    </Screen>
  );
}

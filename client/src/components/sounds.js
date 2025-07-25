import useSound from 'use-sound';

// ✅ Functional sounds
import pauseSoundFile from '../sounds/pause.mp3';
import cleanSoundFile from '../sounds/be-ready.mp3';
import readySoundFile from '../sounds/be ready.mp3';
import verifySuccessFile from '../sounds/success.mp3';
import verifyFailFile from '../sounds/Fail.mp3';

// ✅ Bingo number calls (1–75)
import call1 from '../sounds/call_1.mp3';
import call2 from '../sounds/call_2.mp3';
import call3 from '../sounds/call_3.mp3';
import call4 from '../sounds/call_4.mp3';
import call5 from '../sounds/call_5.mp3';
import call6 from '../sounds/call_6.mp3';
import call7 from '../sounds/call_7.mp3';
import call8 from '../sounds/call_8.mp3';
import call9 from '../sounds/call_9.mp3';
import call10 from '../sounds/call_10.mp3';
import call11 from '../sounds/call_11.mp3';
import call12 from '../sounds/call_12.mp3';
import call13 from '../sounds/call_13.mp3';
import call14 from '../sounds/call_14.mp3';
import call15 from '../sounds/call_15.mp3';
import call16 from '../sounds/call_16.mp3';
import call17 from '../sounds/call_17.mp3';
import call18 from '../sounds/call_18.mp3';
import call19 from '../sounds/call_19.mp3';
import call20 from '../sounds/call_20.mp3';
import call21 from '../sounds/call_21.mp3';
import call22 from '../sounds/call_22.mp3';
import call23 from '../sounds/call_23.mp3';
import call24 from '../sounds/call_24.mp3';
import call25 from '../sounds/call_25.mp3';
import call26 from '../sounds/call_26.mp3';
import call27 from '../sounds/call_27.mp3';
import call28 from '../sounds/call_28.mp3';
import call29 from '../sounds/call_29.mp3';
import call30 from '../sounds/call_30.mp3';
import call31 from '../sounds/call_31.mp3';
import call32 from '../sounds/call_32.mp3';
import call33 from '../sounds/call_33.mp3';
import call34 from '../sounds/call_34.mp3';
import call35 from '../sounds/call_35.mp3';
import call36 from '../sounds/call_36.mp3';
import call37 from '../sounds/call_37.mp3';
import call38 from '../sounds/call_38.mp3';
import call39 from '../sounds/call_39.mp3';
import call40 from '../sounds/call_40.mp3';
import call41 from '../sounds/call_41.mp3';
import call42 from '../sounds/call_42.mp3';
import call43 from '../sounds/call_43.mp3';
import call44 from '../sounds/call_44.mp3';
import call45 from '../sounds/call_45.mp3';
import call46 from '../sounds/call_46.mp3';
import call47 from '../sounds/call_47.mp3';
import call48 from '../sounds/call_48.mp3';
import call49 from '../sounds/call_49.mp3';
import call50 from '../sounds/call_50.mp3';
import call51 from '../sounds/call_51.mp3';
import call52 from '../sounds/call_52.mp3';
import call53 from '../sounds/call_53.mp3';
import call54 from '../sounds/call_54.mp3';
import call55 from '../sounds/call_55.mp3';
import call56 from '../sounds/call_56.mp3';
import call57 from '../sounds/call_57.mp3';
import call58 from '../sounds/call_58.mp3';
import call59 from '../sounds/call_59.mp3';
import call60 from '../sounds/call_60.mp3';
import call61 from '../sounds/call_61.mp3';
import call62 from '../sounds/call_62.mp3';
import call63 from '../sounds/call_63.mp3';
import call64 from '../sounds/call_64.mp3';
import call65 from '../sounds/call_65.mp3';
import call66 from '../sounds/call_66.mp3';
import call67 from '../sounds/call_67.mp3';
import call68 from '../sounds/call_68.mp3';
import call69 from '../sounds/call_69.mp3';
import call70 from '../sounds/call_70.mp3';
import call71 from '../sounds/call_71.mp3';
import call72 from '../sounds/call_72.mp3';
import call73 from '../sounds/call_73.mp3';
import call74 from '../sounds/call_74.mp3';
import call75 from '../sounds/call_75.mp3';

// ✅ Array of number-call sound hooks
const callSounds = [
  call1, call2, call3, call4, call5, call6, call7, call8, call9, call10,
  call11, call12, call13, call14, call15, call16, call17, call18, call19, call20,
  call21, call22, call23, call24, call25, call26, call27, call28, call29, call30,
  call31, call32, call33, call34, call35, call36, call37, call38, call39, call40,
  call41, call42, call43, call44, call45, call46, call47, call48, call49, call50,
  call51, call52, call53, call54, call55, call56, call57, call58, call59, call60,
  call61, call62, call63, call64, call65, call66, call67, call68, call69, call70,
  call71, call72, call73, call74, call75
];

// ✅ Hook to play number call sound
export const useCallSound = () => {
  // Call useSound for each sound at the top level of the hook
  const players = [];
  for (let i = 0; i < callSounds.length; i++) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [play] = useSound(callSounds[i]);
    players.push(play);
  }

  return (number) => {
    if (number >= 1 && number <= 75) {
      players[number - 1]?.();
    }
  };
};

// ✅ Other game action sounds
export const usePauseSound = () => {
  const [play] = useSound(pauseSoundFile);
  return play;
};

export const useCleanSound = () => {
  const [play] = useSound(cleanSoundFile);
  return play;
};
export const useReadySound = () => {
  const [play] = useSound(readySoundFile);
  return play;
};

export const useVerifySuccessSound = () => {
  const [play] = useSound(verifySuccessFile);
  return play;
};

export const useVerifyFailSound = () => {
  const [play] = useSound(verifyFailFile);
  return play;
};

import { useState, useCallback } from 'react';
import { 
  TimelineSnapshot, 
  VideoClipSegment, 
  TextOverlayItem, 
  OverlayCutoutItem,
  AudioTrackItem,
  FilterType, 
  LutPresetType,
  AspectRatioType 
} from '../types/editor';

const MAX_HISTORY_LIMIT = 35;

interface UseTimelineHistoryProps {
  initialState: {
    videoClips: VideoClipSegment[];
    textOverlays: TextOverlayItem[];
    overlayCutouts: OverlayCutoutItem[];
    audioTrack: AudioTrackItem;
    activeFilter: FilterType;
    activeLut: LutPresetType;
    filterIntensity: number;
    playbackSpeed: number;
    aspectRatio: AspectRatioType;
    anamorphicLetterbox: boolean;
    depthOfFieldBlur: number;
  };
}

export function useTimelineHistory({ initialState }: UseTimelineHistoryProps) {
  // Current active composition snapshot
  const [present, setPresent] = useState<TimelineSnapshot>({
    ...initialState,
    videoClips: JSON.parse(JSON.stringify(initialState.videoClips)),
    textOverlays: JSON.parse(JSON.stringify(initialState.textOverlays)),
    overlayCutouts: JSON.parse(JSON.stringify(initialState.overlayCutouts)),
    audioTrack: JSON.parse(JSON.stringify(initialState.audioTrack)),
    actionDescription: 'Project Initialized',
    timestamp: Date.now(),
  });

  // Double stacks for undo and redo
  const [past, setPast] = useState<TimelineSnapshot[]>([]);
  const [future, setFuture] = useState<TimelineSnapshot[]>([]);

  // Push a new immutable state onto history
  const pushState = useCallback((
    actionDescription: string,
    updater: Partial<Omit<TimelineSnapshot, 'actionDescription' | 'timestamp'>> | ((prev: TimelineSnapshot) => Partial<Omit<TimelineSnapshot, 'actionDescription' | 'timestamp'>>)
  ) => {
    setPresent((currentPresent) => {
      const updates = typeof updater === 'function' ? updater(currentPresent) : updater;
      
      const newSnapshot: TimelineSnapshot = {
        videoClips: updates.videoClips ? JSON.parse(JSON.stringify(updates.videoClips)) : currentPresent.videoClips,
        textOverlays: updates.textOverlays ? JSON.parse(JSON.stringify(updates.textOverlays)) : currentPresent.textOverlays,
        overlayCutouts: updates.overlayCutouts ? JSON.parse(JSON.stringify(updates.overlayCutouts)) : currentPresent.overlayCutouts,
        audioTrack: updates.audioTrack ? JSON.parse(JSON.stringify(updates.audioTrack)) : currentPresent.audioTrack,
        activeFilter: updates.activeFilter !== undefined ? updates.activeFilter : currentPresent.activeFilter,
        activeLut: updates.activeLut !== undefined ? updates.activeLut : currentPresent.activeLut,
        filterIntensity: updates.filterIntensity !== undefined ? updates.filterIntensity : currentPresent.filterIntensity,
        playbackSpeed: updates.playbackSpeed !== undefined ? updates.playbackSpeed : currentPresent.playbackSpeed,
        aspectRatio: updates.aspectRatio !== undefined ? updates.aspectRatio : currentPresent.aspectRatio,
        anamorphicLetterbox: updates.anamorphicLetterbox !== undefined ? updates.anamorphicLetterbox : currentPresent.anamorphicLetterbox,
        depthOfFieldBlur: updates.depthOfFieldBlur !== undefined ? updates.depthOfFieldBlur : currentPresent.depthOfFieldBlur,
        actionDescription,
        timestamp: Date.now(),
      };

      setPast((prevPast) => {
        const nextPast = [...prevPast, currentPresent];
        if (nextPast.length > MAX_HISTORY_LIMIT) {
          return nextPast.slice(nextPast.length - MAX_HISTORY_LIMIT);
        }
        return nextPast;
      });

      // Clear future redo stack on new operation
      setFuture([]);

      return newSnapshot;
    });
  }, []);

  // Undo operation
  const undo = useCallback(() => {
    setPast((prevPast) => {
      if (prevPast.length === 0) return prevPast;

      const previous = prevPast[prevPast.length - 1];
      const newPast = prevPast.slice(0, prevPast.length - 1);

      setPresent((currentPresent) => {
        setFuture((prevFuture) => [currentPresent, ...prevFuture]);
        return previous;
      });

      return newPast;
    });
  }, []);

  // Redo operation
  const redo = useCallback(() => {
    setFuture((prevFuture) => {
      if (prevFuture.length === 0) return prevFuture;

      const next = prevFuture[0];
      const newFuture = prevFuture.slice(1);

      setPresent((currentPresent) => {
        setPast((prevPast) => [...prevPast, currentPresent]);
        return next;
      });

      return newFuture;
    });
  }, []);

  // Jump to specific snapshot in history list
  const jumpToHistoryIndex = useCallback((targetIndex: number) => {
    setPast((prevPast) => {
      if (targetIndex < 0 || targetIndex >= prevPast.length) return prevPast;

      const target = prevPast[targetIndex];
      const remainingPast = prevPast.slice(0, targetIndex);
      
      setPresent((currentPresent) => {
        const discardedFromPast = prevPast.slice(targetIndex + 1);
        setFuture((prevFuture) => [...discardedFromPast, currentPresent, ...prevFuture]);
        return target;
      });

      return remainingPast;
    });
  }, []);

  // Reset entire history with fresh media
  const resetHistory = useCallback((newState: {
    videoClips: VideoClipSegment[];
    textOverlays: TextOverlayItem[];
    overlayCutouts: OverlayCutoutItem[];
    audioTrack: AudioTrackItem;
    activeFilter: FilterType;
    activeLut: LutPresetType;
    filterIntensity: number;
    playbackSpeed: number;
    aspectRatio: AspectRatioType;
    anamorphicLetterbox: boolean;
    depthOfFieldBlur: number;
  }, description = 'New Media Composition Initialized') => {
    setPast([]);
    setFuture([]);
    setPresent({
      ...newState,
      videoClips: JSON.parse(JSON.stringify(newState.videoClips)),
      textOverlays: JSON.parse(JSON.stringify(newState.textOverlays)),
      overlayCutouts: JSON.parse(JSON.stringify(newState.overlayCutouts)),
      audioTrack: JSON.parse(JSON.stringify(newState.audioTrack)),
      actionDescription: description,
      timestamp: Date.now(),
    });
  }, []);

  return {
    state: present,
    pushState,
    undo,
    redo,
    canUndo: past.length > 0,
    canRedo: future.length > 0,
    past,
    future,
    jumpToHistoryIndex,
    resetHistory,
    lastUndoDescription: past.length > 0 ? past[past.length - 1].actionDescription : null,
    nextRedoDescription: future.length > 0 ? future[0].actionDescription : null,
  };
}

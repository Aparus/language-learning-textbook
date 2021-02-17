import { Audio } from 'expo-av'
import mitt from 'mitt'
import { setPlayerState } from '../../../store/playerStateActions'
import store from '../../../store/rootReducer'
import contentFiles from '../../../../assets/contentFilesMap'
import PlayerBasic from './playerBasicClass'

const {
	content: { audios }
} = contentFiles

class PlayerPhrasal extends PlayerBasic {
	constructor(mediaRef, phrases) {
		// this.init(audioId, contentType)
		super(mediaRef)
		this.currentPhraseNum = 0
		this.phrases = phrases
	}

	onPlayAudioUpdate = playbackStatus => {
		const { positionMillis, didJustFinish, isPlaying } = playbackStatus
		// console.log('playbackStatus', playbackStatus)
		const currentTime = positionMillis / 1000
		const phrasesCount = this.phrases.length
		// const { isPlaying } = playbackStatus
		this.isPlaying = isPlaying
		this.currentTime = currentTime
		const { end: currentPhaseEnd } = this.phrases[this.currentPhraseNum] || {}

		if (
			currentTime > currentPhaseEnd &&
			this.currentPhraseNum < phrasesCount - 1
		) {
			this.currentPhraseNum++
		}

		const currentPhraseNum = this.currentPhraseNum

		this.events.emit('isPlaying', isPlaying)
		this.events.emit('currentTime', currentTime)
		this.events.emit('currentPhraseNum', currentPhraseNum)
		this.events.emit('didJustFinish', didJustFinish)
	}

	onPlayPhraseAudioUpdate = playbackStatus => {
		const { positionMillis, isPlaying } = playbackStatus
		const currentTime = positionMillis / 1000
		this.currentTime = currentTime
		const { end: currentPhaseEnd } = this.phrases[this.currentPhraseNum] || {}

		if (currentTime >= currentPhaseEnd) {
			this.mediaObject.pauseAsync()
		}

		this.events.emit('isPlaying', isPlaying)
		this.events.emit('currentTime', currentTime)
	}

	play() {
		this.mediaObject.setOnPlaybackStatusUpdate(this.onPlayAudioUpdate)
		this.mediaObject.playAsync()
		this.events.emit('play')
	}

	async playPhrase(phraseNum) {
		this.mediaObject.setOnPlaybackStatusUpdate(this.onPlayPhraseAudioUpdate)
		this.currentPhraseNum = phraseNum
		this.events.emit('currentPhraseNum', phraseNum)

		const { start } = this.phrases[phraseNum]
		await this.mediaObject.setStatusAsync({ positionMillis: start * 1000 })
		this.mediaObject.playAsync()
	}
	async playNextPhrase() {
		this.currentPhraseNum++
		if (this.currentPhraseNum > this.phrases.length - 1) {
			this.currentPhraseNum = this.phrases.length - 1
			return
		}
		if (this.currentTime === 0) {
			this.playPhrase(0)
		}
		this.playPhrase(this.currentPhraseNum)
	}
	async playPreviousPhrase() {
		this.currentPhraseNum--
		if (this.currentPhraseNum < 0) {
			this.currentPhraseNum = 0
			return
		}
		this.playPhrase(this.currentPhraseNum)
	}
	async playCurrentPhrase() {
		// replay
		this.playPhrase(this.currentPhraseNum)
	}

	seek(time) {
		this.setStatus({ positionMillis: time * 1000, shouldPlay: this.shouldPlay })
		this.events.emit('currentTime', time)
		this.currentPhraseNum = this.findCurrentPhraseNum(time)
		this.events.emit('currentPhraseNum', this.currentPhraseNum)
	}
	findCurrentPhraseNum(time) {
		const findIndex = (array, time) => {
			return (
				array.findIndex((elem, index, array) => {
					const { end: thisEnd } = elem
					const { end: nextEnd } = array[index + 1] || 100000000
					return time >= thisEnd && time <= nextEnd
				}) + 1
			)
		}
		const findedIndex = findIndex(this.phrases, time)

		return findedIndex ? findedIndex : this.phrases.length - 1
	}
}

export default PlayerPhrasal
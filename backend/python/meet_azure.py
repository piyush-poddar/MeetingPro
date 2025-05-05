import os
import time
import io
import pygame
import azure.cognitiveservices.speech as speechsdk
import pyaudio
from six.moves import queue

# Audio recording parameters (same as before)
RATE = 16000
CHUNK = int(RATE / 10)  # 100ms

# Initialize Pygame for playback (same as before)
pygame.mixer.init()

class MicrophoneStream:
    def __init__(self, rate, chunk):
        self.rate = rate
        self.chunk = chunk
        self.buff = queue.Queue()
        self.closed = True

    def __enter__(self):
        self.audio_interface = pyaudio.PyAudio()
        self.audio_stream = self.audio_interface.open(
            format=pyaudio.paInt16,
            channels=1,
            rate=self.rate,
            input=True,
            frames_per_buffer=self.chunk,
            input_device_index=self.get_vb_cable_index(),
            stream_callback=self._fill_buffer,
        )
        self.closed = False
        return self

    def __exit__(self, type, value, traceback):
        self.audio_stream.stop_stream()
        self.audio_stream.close()
        self.closed = True
        self.buff.put(None)
        self.audio_interface.terminate()

    def _fill_buffer(self, in_data, frame_count, time_info, status_flags):
        self.buff.put(in_data)
        return None, pyaudio.paContinue

    def generator(self):
        while not self.closed:
            chunk = self.buff.get()
            if chunk is None:
                return
            yield chunk

    def get_buffer(self):
        return self.buff.get()

    def get_vb_cable_index(self):
        for i in range(self.audio_interface.get_device_count()):
            device_info = self.audio_interface.get_device_info_by_index(i)
            if "VB-Audio Virtual Cable" in device_info.get("name", ""):
                print(f"Found VB-Cable at index {i}: {device_info.get('name', '')}")
                return i
        raise ValueError("VB Cable not found. Ensure it's set up correctly.")

def play_audio_from_memory(audio_data):
    """Streams audio from memory using Pygame."""
    # Reset the stream pointer to the beginning
    audio_stream = io.BytesIO(audio_data) # Re-wrap audio_data in BytesIO here as well to ensure seek() is available
    audio_stream.seek(0)
    try:
        pygame.mixer.music.load(audio_stream, "mp3") # Trying "mp3" format as suggested
        pygame.mixer.music.play()
        while pygame.mixer.music.get_busy():
            pygame.time.Clock().tick(10)
    except pygame.error as e:
        print(f"Error playing audio: {e}")

class AzureTranslator:
    def __init__(self, source_language="en-US", target_language="hi-IN"): # Hardcoded languages now for simplicity
        # Get configuration from environment variables
        subscription_key = os.environ.get('SPEECH_KEY')
        region = os.environ.get('SPEECH_REGION')

        if not subscription_key:
            raise ValueError("SPEECH_KEY environment variable is required")
        if not region:
            raise ValueError("SPEECH_REGION environment variable is required")

        self.source_language = source_language
        self.target_language = target_language

        # Configure speech translation
        self.speech_config = speechsdk.SpeechConfig(
            subscription=subscription_key,
            region=region
        )

        # Configure speech synthesis
        self.speech_synthesizer = speechsdk.SpeechSynthesizer(
            speech_config=self.speech_config
        )

        # Set up translation config
        self.translation_config = speechsdk.translation.SpeechTranslationConfig(
            subscription=subscription_key,
            region=region
        )
        self.translation_config.speech_recognition_language = source_language
        self.translation_config.add_target_language(target_language.split('-')[0])

        # Create translation recognizer
        self.push_stream = speechsdk.audio.PushAudioInputStream()
        audio_input_config = speechsdk.audio.AudioConfig(stream=self.push_stream)

        self.translator = speechsdk.translation.TranslationRecognizer(
            translation_config=self.translation_config,
            audio_config=audio_input_config
        )

        self.done = False
        self.setup_handlers()


    def setup_handlers(self):
        """Set up event handlers - simplified version without deduplication"""
        def handle_final_result(evt):
            if evt.result.reason == speechsdk.ResultReason.TranslatedSpeech:
                original_text = evt.result.text
                translated_text = evt.result.translations[self.target_language.split('-')[0]]

                self.process_translation(evt.result) # Directly process translation

        # Remove disconnected handlers (although not strictly needed in this simplified version as we are not reconnecting handlers dynamically)
        self.translator.recognized.disconnect_all()
        self.translator.recognizing.disconnect_all()
        self.translator.canceled.disconnect_all()

        # Connect handlers - simplified
        self.translator.recognized.connect(handle_final_result)
        self.translator.session_stopped.connect(lambda evt: setattr(self, 'done', True))


    def process_translation(self, result):
        """Process translation result - simplified"""
        original_text = result.text
        translated_text = result.translations[self.target_language.split('-')[0]]

        print(f"Original: {original_text}")
        print(f"Translated: {translated_text}")

        # Synthesize and play the translated text
        audio_data = self.synthesize_speech(translated_text)
        if audio_data:
            play_audio_from_memory(audio_data)


    def synthesize_speech(self, text):
        """Convert text to speech using Azure's TTS - same as before"""
        try:
            result = self.speech_synthesizer.speak_text_async(text).get()
            if result.reason == speechsdk.ResultReason.SynthesizingAudioCompleted:
                return result.audio_data
            else:
                print(f"Speech synthesis failed: {result.reason}")
                return None
        except Exception as e:
            print(f"Error in speech synthesis: {e}")
            return None

    def start_translation(self):
        """Start the translation process - same as before"""
        self.translator.start_continuous_recognition()

        try:
            with MicrophoneStream(RATE, CHUNK) as stream:
                print("Listening... (Press Ctrl+C to exit)")
                while not self.done:
                    audio_chunk = stream.get_buffer()
                    if audio_chunk is None:
                        break
                    self.push_stream.write(audio_chunk)

        except KeyboardInterrupt:
            print("\nStopping translation...")
        finally:
            self.translator.stop_continuous_recognition()
            self.push_stream.close()


def main():
    # Language settings are now hardcoded in AzureTranslator class for simplicity
    source_language = 'hi-IN' # Example: English (US)
    target_language = 'en-US' # Example: Hindi (India)

    translator = AzureTranslator(
        source_language=source_language,
        target_language=target_language
    )

    translator.start_translation()

if __name__ == "__main__":
    main()
import Foundation
import ScreenCaptureKit
import AVFoundation

@available(macOS 13.0, *)
class ScreenAudioCaptureManager: NSObject, SCStreamOutput, SCStreamDelegate {
    private var stream: SCStream?
    private let audioEngine = AVAudioEngine()
    private let outputPipe = FileHandle.standardOutput

    func start() async throws {
        // 1. Setup ScreenCaptureKit for System Audio
        let content = try await SCShareableContent.excludingDesktopWindows(false, onScreenWindowsOnly: true)
        guard let display = content.displays.first else {
            fputs("Error: No display found for ScreenCaptureKit\n", stderr)
            exit(1)
        }

        let filter = SCContentFilter(display: display, excludingApplications: [], exceptingWindows: [])
        let config = SCStreamConfiguration()
        config.capturesAudio = true
        config.sampleRate = 16000
        config.channelCount = 1 // System Audio (Channel 1)

        stream = SCStream(filter: filter, configuration: config, delegate: self)
        try stream?.addStreamOutput(self, type: .audio, sampleHandlerQueue: DispatchQueue(label: "ovsyanka.audio.system"))
        try await stream?.startCapture()

        // 2. Setup AVAudioEngine for Microphone
        let inputNode = audioEngine.inputNode
        let bus = 0
        let micFormat = inputNode.inputFormat(forBus: bus)

        inputNode.installTap(onBus: bus, bufferSize: 1024, format: micFormat) { [weak self] (buffer, time) in
            self?.handleMicrophoneBuffer(buffer)
        }

        try audioEngine.start()
        fputs("ScreenAudioCapture: Recording active (ScreenCaptureKit + AVAudioEngine)\n", stderr)
    }

    func stream(_ stream: SCStream, didOutputSampleBuffer sampleBuffer: CMSampleBuffer, of type: SCStreamOutputType) {
        guard type == .audio else { return }
        // Process system audio buffer (remote participants)
        if let blockBuffer = CMSampleBufferGetDataBuffer(sampleBuffer) {
            var length = 0
            var dataPointer: UnsafeMutablePointer<Int8>?
            CMBlockBufferGetDataPointer(blockBuffer, atOffset: 0, lengthAtOffsetOut: nil, totalLengthOut: &length, dataPointerOut: &dataPointer)
            if let dataPointer = dataPointer, length > 0 {
                let data = Data(bytes: dataPointer, count: length)
                // Write formatted packet: [Type: 1 byte (1=System, 0=Mic)][Len: 4 bytes][Payload]
                var header = Data([0x01])
                var lenBytes = UInt32(length).bigEndian
                header.append(Data(bytes: &lenBytes, count: 4))
                outputPipe.write(header + data)
            }
        }
    }

    private func handleMicrophoneBuffer(_ buffer: AVAudioPCMBuffer) {
        // Process user microphone buffer
        guard let channelData = buffer.floatChannelData else { return }
        let frameLength = Int(buffer.frameLength)
        let samples = channelData[0]
        
        // Convert Float32 to Int16 PCM
        var pcmData = Data(capacity: frameLength * 2)
        for i in 0..<frameLength {
            let sample = max(-1.0, min(1.0, samples[i]))
            var intSample = Int16(sample * 32767.0).littleEndian
            pcmData.append(Data(bytes: &intSample, count: 2))
        }

        var header = Data([0x00]) // 0x00 = Mic
        var lenBytes = UInt32(pcmData.count).bigEndian
        header.append(Data(bytes: &lenBytes, count: 4))
        outputPipe.write(header + pcmData)
    }

    func stop() async {
        try? await stream?.stopCapture()
        audioEngine.stop()
        audioEngine.inputNode.removeTap(onBus: 0)
    }
}

if #available(macOS 13.0, *) {
    let capture = ScreenAudioCaptureManager()
    Task {
        do {
            try await capture.start()
        } catch {
            fputs("Failed to start audio capture: \(error)\n", stderr)
            exit(1)
        }
    }
    RunLoop.main.run()
} else {
    fputs("macOS 13.0 or higher is required for ScreenCaptureKit\n", stderr)
    exit(1)
}

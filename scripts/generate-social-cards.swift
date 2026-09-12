#!/usr/bin/env swift

import AppKit
import Foundation

struct SocialCard {
    let output: String
    let screenshot: String
    let title: String
    let subtitle: String
    let colors: [NSColor]
}

let root = URL(fileURLWithPath: FileManager.default.currentDirectoryPath)
let cards = [
    SocialCard(
        output: "feature-todos-social.png",
        screenshot: "tandem-home-v230.png",
        title: "Shared to-dos,\nbuilt for two.",
        subtitle: "Clear ownership without reminder texts.",
        colors: [NSColor(calibratedRed: 0.96, green: 0.94, blue: 1.00, alpha: 1), NSColor(calibratedRed: 1.00, green: 0.96, blue: 0.95, alpha: 1)]
    ),
    SocialCard(
        output: "feature-calendar-social.png",
        screenshot: "tandem-calendar-v230.png",
        title: "One calendar for\ntwo busy lives.",
        subtitle: "Plans, reminders and time together in sync.",
        colors: [NSColor(calibratedRed: 0.92, green: 0.98, blue: 0.98, alpha: 1), NSColor(calibratedRed: 0.96, green: 0.94, blue: 1.00, alpha: 1)]
    ),
    SocialCard(
        output: "feature-money-social.png",
        screenshot: "finance-preview.png",
        title: "Shared spending,\nwithout confusion.",
        subtitle: "See what you spend together—without bank access.",
        colors: [NSColor(calibratedRed: 1.00, green: 0.96, blue: 0.92, alpha: 1), NSColor(calibratedRed: 1.00, green: 0.94, blue: 0.96, alpha: 1)]
    ),
    SocialCard(
        output: "feature-weekly-sync-social.png",
        screenshot: "tandem-weekly-sync-v230.png",
        title: "A weekly pause\nto stay connected.",
        subtitle: "Reflect privately. Reveal together. Choose one promise.",
        colors: [NSColor(calibratedRed: 0.95, green: 0.93, blue: 1.00, alpha: 1), NSColor(calibratedRed: 1.00, green: 0.95, blue: 0.94, alpha: 1)]
    )
]

func drawImageAspectFill(_ image: NSImage, in destination: NSRect) {
    let sourceSize = image.size
    let scale = max(destination.width / sourceSize.width, destination.height / sourceSize.height)
    let sourceWidth = destination.width / scale
    let sourceHeight = destination.height / scale
    let source = NSRect(
        x: (sourceSize.width - sourceWidth) / 2,
        y: sourceSize.height - sourceHeight,
        width: sourceWidth,
        height: sourceHeight
    )
    image.draw(in: destination, from: source, operation: .sourceOver, fraction: 1, respectFlipped: true, hints: [.interpolation: NSImageInterpolation.high])
}

guard let logo = NSImage(contentsOf: root.appendingPathComponent("assets/tandem-logo-200.png")) else {
    fatalError("Missing Tandem logo")
}

for card in cards {
    guard let screenshot = NSImage(contentsOf: root.appendingPathComponent("assets/\(card.screenshot)")) else {
        fatalError("Missing screenshot: \(card.screenshot)")
    }

    let canvas = NSImage(size: NSSize(width: 1200, height: 630))
    canvas.lockFocus()
    NSGraphicsContext.current?.imageInterpolation = .high

    let canvasRect = NSRect(x: 0, y: 0, width: 1200, height: 630)
    NSGradient(colors: card.colors)?.draw(in: canvasRect, angle: -12)

    let glow = NSBezierPath(ovalIn: NSRect(x: 720, y: -190, width: 650, height: 650))
    NSColor.white.withAlphaComponent(0.52).setFill()
    glow.fill()

    logo.draw(in: NSRect(x: 72, y: 492, width: 66, height: 66), from: .zero, operation: .sourceOver, fraction: 1)
    let brand = NSAttributedString(string: "Tandem", attributes: [
        .font: NSFont.systemFont(ofSize: 29, weight: .semibold),
        .foregroundColor: NSColor(calibratedWhite: 0.12, alpha: 1)
    ])
    brand.draw(at: NSPoint(x: 152, y: 507))

    let title = NSAttributedString(string: card.title, attributes: [
        .font: NSFont.systemFont(ofSize: 58, weight: .bold),
        .foregroundColor: NSColor(calibratedRed: 0.10, green: 0.08, blue: 0.13, alpha: 1),
        .paragraphStyle: {
            let style = NSMutableParagraphStyle()
            style.lineSpacing = -2
            return style
        }()
    ])
    title.draw(with: NSRect(x: 72, y: 235, width: 690, height: 230), options: [.usesLineFragmentOrigin, .usesFontLeading])

    let subtitle = NSAttributedString(string: card.subtitle, attributes: [
        .font: NSFont.systemFont(ofSize: 25, weight: .regular),
        .foregroundColor: NSColor(calibratedRed: 0.30, green: 0.27, blue: 0.34, alpha: 1)
    ])
    subtitle.draw(with: NSRect(x: 76, y: 145, width: 650, height: 70), options: [.usesLineFragmentOrigin, .usesFontLeading])

    let pillRect = NSRect(x: 74, y: 67, width: 245, height: 48)
    let pill = NSBezierPath(roundedRect: pillRect, xRadius: 24, yRadius: 24)
    NSColor.white.withAlphaComponent(0.78).setFill()
    pill.fill()
    let pillText = NSAttributedString(string: "Free on iOS & Android", attributes: [
        .font: NSFont.systemFont(ofSize: 17, weight: .semibold),
        .foregroundColor: NSColor(calibratedRed: 0.32, green: 0.24, blue: 0.55, alpha: 1)
    ])
    pillText.draw(at: NSPoint(x: 95, y: 80))

    let phoneRect = NSRect(x: 888, y: -54, width: 270, height: 706)
    let phonePath = NSBezierPath(roundedRect: phoneRect, xRadius: 42, yRadius: 42)
    NSGraphicsContext.saveGraphicsState()
    phonePath.addClip()
    NSColor.white.setFill()
    phonePath.fill()
    drawImageAspectFill(screenshot, in: phoneRect.insetBy(dx: 7, dy: 7))
    NSGraphicsContext.restoreGraphicsState()
    NSColor.white.withAlphaComponent(0.95).setStroke()
    phonePath.lineWidth = 7
    phonePath.stroke()

    canvas.unlockFocus()

    var proposed = canvasRect
    guard let cgImage = canvas.cgImage(forProposedRect: &proposed, context: nil, hints: nil) else {
        fatalError("Could not render \(card.output)")
    }
    let representation = NSBitmapImageRep(cgImage: cgImage)
    guard let data = representation.representation(using: .png, properties: [.compressionFactor: 0.88]) else {
        fatalError("Could not encode \(card.output)")
    }
    try data.write(to: root.appendingPathComponent("assets/\(card.output)"))
    print("Generated assets/\(card.output)")
}

#!/usr/bin/env ruby
# frozen_string_literal: true

require "pathname"
require "yaml"
require "date"
require "uri"

ROOT = Pathname.new(__dir__).join("..").expand_path
NOTE_FILES = ROOT.glob("_notes/**/*.md")
PAGE_FILES = ROOT.glob("_pages/**/*.{md,html}")

def front_matter(path)
  text = path.read(encoding: "UTF-8")
  return [{}, text] unless text.start_with?("---\n")

  _, yaml, body = text.split("---\n", 3)
  [YAML.safe_load(yaml, permitted_classes: [Date, Time], aliases: true) || {}, body || ""]
rescue Psych::SyntaxError => e
  [{ "__yaml_error" => e.message }, text || ""]
end

def each_content_line(body)
  in_fence = false

  body.each_line.with_index(1) do |line, index|
    in_fence = !in_fence if line.start_with?("```")
    yield line, index, in_fence
  end
end

problems = []
permalinks = {}

NOTE_FILES.each do |path|
  data, body = front_matter(path)
  rel = path.relative_path_from(ROOT).to_s

  if data["__yaml_error"]
    problems << "#{rel}: front matter YAML is invalid"
    next
  end

  missing = %w[number title subject].reject { |key| data.key?(key) }
  problems << "#{rel}: missing front matter keys: #{missing.join(', ')}" unless missing.empty?

  each_content_line(body) do |line, index, in_fence|
    next if in_fence

    problems << "#{rel}:#{index}: Obsidian wikilink remains" if line.include?("[[") || line.include?("]]")
    problems << "#{rel}:#{index}: body metadata line should be front matter or generated navigation" if line.match?(/^\s*(previous|next|tag):/)
  end

  body.scan(/!\[[^\]]*\]\(([^)]+)\)/).flatten.each do |raw_link|
    link = raw_link.sub(/\A</, "").sub(/>\z/, "")
    next unless link.start_with?("/notes/") || link.start_with?("/images/")

    decoded = link.split("/").map { |segment| URI.decode_www_form_component(segment) }.join("/")
    asset =
      if decoded.start_with?("/notes/")
        ROOT.join(decoded.sub(%r{\A/notes/}, "_notes/"))
      else
        ROOT.join(decoded.sub(%r{\A/}, ""))
      end

    problems << "#{rel}: missing image asset #{decoded}" unless asset.file?
  end
end

PAGE_FILES.each do |path|
  data, = front_matter(path)
  next unless data["permalink"]

  rel = path.relative_path_from(ROOT).to_s
  permalinks[data["permalink"]] ||= []
  permalinks[data["permalink"]] << rel
end

permalinks.each do |permalink, paths|
  next if paths.size == 1

  problems << "duplicate permalink #{permalink}: #{paths.join(', ')}"
end

if problems.empty?
  puts "notes rendering audit passed"
else
  warn problems.join("\n")
  exit 1
end

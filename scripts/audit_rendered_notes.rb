#!/usr/bin/env ruby
# frozen_string_literal: true

require "nokogiri"
require "pathname"
require "uri"

ROOT = Pathname.new(__dir__).join("..").expand_path
SITE = ROOT.join("_site")
problems = []

ROOT.glob("_site/notes/**/*.html").each do |path|
  html = path.read(encoding: "UTF-8")
  doc = Nokogiri::HTML(html)
  rel = path.relative_path_from(ROOT).to_s

  doc.css("script, style, code, pre").remove
  text = doc.text

  if text.match?(/!\[\[|\[\[[^\]]+\]\]|previous:\s*\[\[|next:\s*\[\[|tag:\s*#|原笔记图片未找到/)
    problems << "#{rel}: rendered convention artifact remains"
  end

  doc.css("img").each do |image|
    src = image["src"].to_s
    next unless src.start_with?("/notes/") || src.start_with?("/images/")

    clean_src = src.split("#", 2).first.split("?", 2).first
    decoded_src = clean_src.split("/").map { |segment| URI.decode_www_form_component(segment) }.join("/")
    asset = SITE.join(decoded_src.sub(%r{\A/}, ""))
    problems << "#{rel}: missing rendered image #{src}" unless asset.file?
  end
end

if problems.empty?
  puts "rendered notes audit passed"
else
  warn problems.join("\n")
  exit 1
end

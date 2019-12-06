module Jekyll
  module RegexFilter
    def replace_regex(input, reg_str, repl_str)
      re = Regexp.new reg_str


      input.gsub re, repl_str

    end
    
    def match_regex(input, match_str)
        re = Regexp.new match_str
        if matches = input.match(re)
            if matches[1]
                matches[1]
            else
                matches[0]
            end
        else
            ""
        end
    end
  end
end

Liquid::Template.register_filter(Jekyll::RegexFilter)
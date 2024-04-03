const getWholeKoList = (nickname) => {
  const full_ko_list = [];

  for (let i = 0; i < nickname.length; i++) {
    const char = nickname[i];
    const char_code = char.charCodeAt(0);
    if (char_code >= 0xac00 && char_code <= 0xd7a3) {
      const new_ = { idx: i, text: char };
      full_ko_list.push(new_);
    }
  }
  return full_ko_list;
};

const changeJosa = (text, josa, last_char) => {
  const last_code = last_char.charCodeAt(0);
  const isFinalConsonant = (last_code - 0xac00) % 28 > 0;
  if (isFinalConsonant === true) {
    switch (josa) {
      case '는':
        console.log("닉네임에 받침 있어 조사 '는' => '은' 변경");
        return text.replace(josa, '은');
      case '가':
        console.log("닉네임에 받침 있어 조사 '가' => '이' 변경");
        return text.replace(josa, '이');
      case '를':
        console.log("닉네임에 받침 있어 조사 '를' => '을' 변경");
        return text.replace(josa, '을');
      case '와':
        console.log("닉네임에 받침 있어 조사 '와' => '과' 변경");
        return text.replace(josa, '과');
      case '야':
        console.log("닉네임에 받침 있어 조사 '야' => '아' 변경");
        return text.replace(josa, '아');
      case '여':
        console.log("닉네임에 받침 있어 조사 '여' => '이여' 변경");
        return text.replace(josa, '이여');
      case '랑':
        console.log("닉네임에 받침 있어 조사 '랑' => '이랑' 변경");
        return text.replace(josa, '이랑');
      case '로':
        console.log("닉네임에 받침 있어 조사 '로' => '으로' 변경");
        return text.replace(josa, '으로');
      case '로서':
        console.log("닉네임에 받침 있어 조사 '로서' => '으로서' 변경");
        return text.replace(josa, '으로서');
      case '로써':
        console.log("닉네임에 받침 있어 조사 '로써' => '으로써' 변경");
        return text.replace(josa, '으로써');
      case '로부터':
        console.log("닉네임에 받침 있어 조사 '로부터' => '으로부터' 변경");
        return text.replace(josa, '으로부터');
      default:
        console.log(
          '닉네임에 받침 있으나 텍스트에 바뀌는 조사 없음.',
          '조사:',
          josa,
        );
        return text;
    }
  } else {
    switch (josa) {
      case '은':
        console.log("닉네임에 받침 없어 조사 '은' => '는' 변경");
        return text.replace(josa, '는');
      case '이':
        console.log("닉네임에 받침 없어 조사 '이' => '가' 변경");
        return text.replace(josa, '가');
      case '을':
        console.log("닉네임에 받침 없어 조사 '을' => '를' 변경");
        return text.replace(josa, '를');
      case '과':
        console.log("닉네임에 받침 없어 조사 '과' => '와' 변경");
        return text.replace(josa, '와');
      case '아':
        console.log("닉네임에 받침 없어 조사 '아' => '야' 변경");
        return text.replace(josa, '야');
      case '이여':
        console.log("닉네임에 받침 없어 조사 '이여' => '여' 변경");
        return text.replace(josa, '여');
      case '이랑':
        console.log("닉네임에 받침 없어 조사 '이랑' => '랑' 변경");
        return text.replace(josa, '랑');
      case '으로':
        console.log("닉네임에 받침 없어 조사 '으로' => '로' 변경");
        return text.replace(josa, '로');
      case '으로서':
        console.log("닉네임에 받침 없어 조사 '으로서' => '로서' 변경");
        return text.replace(josa, '로서');
      case '으로써':
        console.log("닉네임에 받침 없어 조사 '으로써' => '로써' 변경");
        return text.replace(josa, '로써');
      case '으로부터':
        console.log("닉네임에 받침 없어 조사 '으로부터' => '로부터' 변경");
        return text.replace(josa, '로부터');
      default:
        console.log(
          `닉네임에 받침 없으나 텍스트에 변경되는 조사 없음.`,
          '조사:',
          josa,
        );
        return text;
    }
  }
};

export default function nicknameModifier(nickname, text) {
  const target_text = '{user name}';
  if (text.indexOf(target_text) !== -1) {
    const full_ko_list = getWholeKoList(nickname);

    if (full_ko_list.length > 0) {
      const last_char_object = full_ko_list.pop();
      const last_char = last_char_object['text'];

      const target_list = [0];
      const splitted_text_list = [];

      const regex = /(\{user name\})([ㄱ-힣]+)?/g;
      const matches = text.matchAll(regex);
      const matches_list = [];

      for (const match of matches) {
        target_list.push(match.index);
        target_list.push(match.index + match[0].length);
        matches_list.push(match);
      }
      target_list.push(text.length);

      let i = 0;
      while (i < target_list.length - 1) {
        const l_idx = target_list[i];
        const r_idx = target_list[i + 1];
        splitted_text_list.push(text.substring(l_idx, r_idx));
        i++;
      }
      console.log(splitted_text_list);
      for (let k = 0; k < splitted_text_list.length; k++) {
        const text_to_change = splitted_text_list[k];
        if (text_to_change === matches_list[0][0]) {
          if (matches_list[0][2] !== undefined) {
            const changed_text = changeJosa(
              text_to_change,
              matches_list[0][2],
              last_char,
            );
            console.log(
              `${k + 1}번째 원소 nickname 변경: {user name} => ${nickname}`,
            );
            splitted_text_list.splice(
              k,
              1,
              changed_text.replace(target_text, nickname),
            );
            matches_list.shift();
          } else {
            console.log(
              `${k + 1}번째 원소 nickname 변경: {user name} => ${nickname}`,
            );
            splitted_text_list.splice(k, 1, nickname);
            matches_list.shift();
          }

          if (matches_list.length === 0) {
            break;
          }
        }
      }
      return splitted_text_list.join('');
    } else {
      console.log('닉네임에 완전한 한글 문자 없음. 호칭만 변경해 발송');
      let new_text = text;
      while (new_text.indexOf(target_text) !== -1) {
        new_text = new_text.replace(target_text, nickname);
      }
      return new_text;
    }
  } else {
    console.log('텍스트에 {user name} 없음. 그대로 발송');
    return text;
  }
}

const translations = {
  zh: {
    title: 'Lyric Tagger',
    subtitle: '歌词打轴工具',
    importMusic: '导入音乐',
    importLyrics: '导入歌词',
    pressSpace: '按 空格键 为当前行打轴',
    importHint: '请先导入歌词文件',
    linesTimed: '已打轴',
    clearTimings: '清空时间轴',
    exportSrt: '导出 SRT',
    contact: '如果程序有故障或逻辑错误请联系作者QQ: ',
    contactSuffix: '，并备注来意',
    instructions: {
      title: '使用说明',
      steps: [
        '1. 点击「导入音乐」选择音频文件',
        '2. 点击「导入歌词」选择 TXT 歌词文件',
        '3. 播放音乐，听到歌词时按空格键打轴',
        '4. 点击歌词行可跳转到该时间点重新打轴',
        '5. 完成后点击「导出 SRT」保存字幕文件'
      ]
    }
  },
  en: {
    title: 'Lyric Tagger',
    subtitle: 'Lyric Timing Tool',
    importMusic: 'Import Music',
    importLyrics: 'Import Lyrics',
    pressSpace: 'Press SPACE to tag current line',
    importHint: 'Please import lyrics file first',
    linesTimed: 'tagged',
    clearTimings: 'Clear All',
    exportSrt: 'Export SRT',
    contact: 'If there are bugs or errors, please report on ',
    contactSuffix: '',
    instructions: {
      title: 'Instructions',
      steps: [
        '1. Click "Import Music" to select audio file',
        '2. Click "Import Lyrics" to select TXT file',
        '3. Play music, press SPACE when lyrics appear',
        '4. Click lyric line to jump to that time',
        '5. Click "Export SRT" to save subtitle file'
      ]
    }
  },
  ja: {
    title: 'Lyric Tagger',
    subtitle: '歌詞タイミングツール',
    importMusic: '音楽をインポート',
    importLyrics: '歌詞をインポート',
    pressSpace: 'スペースキーで歌詞にタイミングを付ける',
    importHint: 'まず歌詞ファイルをインポートしてください',
    linesTimed: '完了',
    clearTimings: 'すべてクリア',
    exportSrt: 'SRTをエクスポート',
    contact: 'バグやエラーがある場合は ',
    contactSuffix: ' で報告してください',
    instructions: {
      title: '使い方',
      steps: [
        '1. 「音楽をインポート」で音声ファイルを選択',
        '2. 「歌詞をインポート」でTXTファイルを選択',
        '3. 音楽を再生し、歌詞が表示されたらスペースキーを押す',
        '4. 歌詞行をクリックするとその時間にジャンプ',
        '5. 「SRTをエクスポート」で字幕ファイルを保存'
      ]
    }
  }
}

export default translations

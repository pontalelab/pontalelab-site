var AppData = {

  materials: [
    { id:'pair1_a',  name:{ ja:'くま',       en:'Bear'         }, image:'assets/images/materials/1_素材A(くま).png'          },
    { id:'pair1_b',  name:{ ja:'くるま',     en:'Car'          }, image:'assets/images/materials/1_素材B(くるま).png'        },
    { id:'pair2_a',  name:{ ja:'うさぎ',     en:'Rabbit'       }, image:'assets/images/materials/２_素材A(うさぎ).png'        },
    { id:'pair2_b',  name:{ ja:'クジャク',   en:'Peacock'      }, image:'assets/images/materials/２_素材B(クジャク).png'      },
    { id:'pair3_a',  name:{ ja:'プリン',     en:'Pudding'      }, image:'assets/images/materials/３_素材A(プリン).png'        },
    { id:'pair3_b',  name:{ ja:'パンダ',     en:'Panda'        }, image:'assets/images/materials/３_素材B(パンダ).png'        },
    { id:'pair4_a',  name:{ ja:'イルカ',     en:'Dolphin'      }, image:'assets/images/materials/４_素材A(イルカ).png'        },
    { id:'pair4_b',  name:{ ja:'クマノミ',   en:'Clownfish'    }, image:'assets/images/materials/４_素材B(クマノミ).png'      },
    { id:'pair5_a',  name:{ ja:'ネコ',       en:'Cat'          }, image:'assets/images/materials/５_素材A(ネコ).png'          },
    { id:'pair5_b',  name:{ ja:'ケーキ',     en:'Cake'         }, image:'assets/images/materials/５_素材B(ケーキ).png'        },
    { id:'pair6_a',  name:{ ja:'へび',       en:'Snake'        }, image:'assets/images/materials/６_素材A(へび).png'          },
    { id:'pair6_b',  name:{ ja:'ドーナツ',   en:'Donut'        }, image:'assets/images/materials/６_素材B(ドーナツ).png'      },
    { id:'pair7_a',  name:{ ja:'りんご',     en:'Apple'        }, image:'assets/images/materials/７_素材A(りんご).png'        },
    { id:'pair7_b',  name:{ ja:'パンダ',     en:'Panda'        }, image:'assets/images/materials/7_素材B(パンダ).png'         },
    { id:'pair8_a',  name:{ ja:'ぞう',       en:'Elephant'     }, image:'assets/images/materials/８_素材A(ぞう).png'          },
    { id:'pair8_b',  name:{ ja:'ビスケット', en:'Biscuit'      }, image:'assets/images/materials/８_素材B(ビスケット).png'    },
    { id:'pair9_a',  name:{ ja:'ミツバチ',   en:'Bee'          }, image:'assets/images/materials/９_素材A(ミツバチ).png'      },
    { id:'pair9_b',  name:{ ja:'つみき',     en:'Blocks'       }, image:'assets/images/materials/９_素材B(つみき).png'        },
    { id:'pair10_a', name:{ ja:'たんぽぽ',   en:'Dandelion'    }, image:'assets/images/materials/10_素材A(たんぽぽ).png'     },
    { id:'pair10_b', name:{ ja:'しろうさぎ', en:'White Rabbit' }, image:'assets/images/materials/10_素材B(白うさぎ).png'     }
  ],

  results: [
    { id:'result1',  materialA:'pair1_a',  materialB:'pair1_b',  image:'assets/images/results/1_結果(くまくまくるま).png' },
    { id:'result2',  materialA:'pair2_a',  materialB:'pair2_b',  image:'assets/images/results/２_結果.png'               },
    { id:'result3',  materialA:'pair3_a',  materialB:'pair3_b',  image:'assets/images/results/３_結果.png'               },
    { id:'result4',  materialA:'pair4_a',  materialB:'pair4_b',  image:'assets/images/results/４_結果.png'               },
    { id:'result5',  materialA:'pair5_a',  materialB:'pair5_b',  image:'assets/images/results/５_結果.png'               },
    { id:'result6',  materialA:'pair6_a',  materialB:'pair6_b',  image:'assets/images/results/６_結果.png'               },
    { id:'result7',  materialA:'pair7_a',  materialB:'pair7_b',  image:'assets/images/results/７_結果.png'               },
    { id:'result8',  materialA:'pair8_a',  materialB:'pair8_b',  image:'assets/images/results/8_結果.png'                },
    { id:'result9',  materialA:'pair9_a',  materialB:'pair9_b',  image:'assets/images/results/９_結果.png'               },
    { id:'result10', materialA:'pair10_a', materialB:'pair10_b', image:'assets/images/results/10_結果.png'              }
  ],

  i18n: {
    ja: {
      home_title:    'AIまぜまぜ けんきゅうしつ',
      home_subtitle: 'ふしぎなものを つくろう！',
      home_start:    'けんきゅうしつへ',
      home_gallery:  'ずかん',

      exp_instruction:  '２つをまぜてみよう！',
      exp_drag_hint:    'ひっぱって いれてね',
      exp_rotate_hint:  'くるくる まわして！',
      exp_almost:       'もうちょっと！',

      result_title:      'できた！',
      result_new_badge:  'はじめて みつけた！',
      result_next:       'つぎへ',
      result_to_gallery: 'ずかんをみる',

      gallery_title:    'ずかん',
      gallery_progress: '{found}／{total} みつけた！',
      gallery_back:     'もどる',
      gallery_locked:   '？',

      lang_ja: '日本語',
      lang_en: 'English',

      result_name_result1:  'くまくまくるま',
      result_name_result2:  'うさぎクジャク',
      result_name_result3:  'パンダプリン',
      result_name_result4:  'イルカのなかよし',
      result_name_result5:  'ネコのケーキ',
      result_name_result6:  'ドーナツへび',
      result_name_result7:  'りんごパンダ',
      result_name_result8:  'ぞうのビスケット',
      result_name_result9:  'ミツバチつみき',
      result_name_result10: 'たんぽぽうさぎ',

      detail_phrase_0: 'どうして　こうなるのかな？🤔',
      detail_phrase_1: 'もっとふしぎが　かくれてるよ！🌟',
      detail_phrase_2: 'はかせに　なれるかも！🔬',
      detail_phrase_3: 'なんで　まざると　かわるんだろう？',
      detail_phrase_4: 'じっけんって　おもしろいね！✨',

      card_detail_back: 'ずかんにもどる'
    },

    en: {
      home_title:    'AI Mix-Mix Lab',
      home_subtitle: 'Make something magical!',
      home_start:    'Enter the Lab',
      home_gallery:  'Gallery',

      exp_instruction:  'Mix the two things together!',
      exp_drag_hint:    'Drag it into the box',
      exp_rotate_hint:  'Spin it around!',
      exp_almost:       'Almost there!',

      result_title:      'You made it!',
      result_new_badge:  'First discovery!',
      result_next:       'Next',
      result_to_gallery: 'See Gallery',

      gallery_title:    'Collection',
      gallery_progress: '{found} / {total} found!',
      gallery_back:     'Back',
      gallery_locked:   '?',

      lang_ja: '日本語',
      lang_en: 'English',

      result_name_result1:  'Bearcar',
      result_name_result2:  'Peacock Rabbit',
      result_name_result3:  'Panda Pudding',
      result_name_result4:  'Dolphin Friends',
      result_name_result5:  'Cat Cake',
      result_name_result6:  'Donut Snake',
      result_name_result7:  'Apple Panda',
      result_name_result8:  'Elephant Biscuit',
      result_name_result9:  'Bee Blocks',
      result_name_result10: 'Dandelion Rabbit',

      detail_phrase_0: 'I wonder why this happens? 🤔',
      detail_phrase_1: 'More mysteries are hiding! 🌟',
      detail_phrase_2: 'You could be a scientist! 🔬',
      detail_phrase_3: 'Why does mixing change things?',
      detail_phrase_4: 'Experiments are amazing! ✨',

      card_detail_back: 'Back to Gallery'
    }
  }
};

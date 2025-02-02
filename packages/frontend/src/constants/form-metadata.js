export const FORM_METADATA = [
  {
    title: "Basic Details",
    description: "Provide the basic information about the discussion topic.",
    fields: [
      {
        component: "DropdownSelect",
        label: "Topic Setting",
        id: "topicSetting",
        name: "topicSetting",
        placeholder: "Select a setting",
        required: true,
        options: [
          { value: "manual", label: "✏️ Type Manually" },
          { value: "ai", label: "🤖 Generate By AI" },
          { value: "dynamic", label: "🔀 Decide During Discussion" },
        ],
      },
      {
        component: "TextInput",
        label: "Discussion Topic",
        id: "topic",
        name: "topic",
        placeholder: "Enter your topic",
        conditions: {
          disabledCondition: [
            {
              id: "topicSetting",
              value: ["ai", "dynamic"],
            },
          ],
          requiredCondition: [
            {
              id: "topicSetting",
              value: ["manual"],
            },
          ],
        },
      },
    ],
  },
  // {
  //   title: "Users Settings",
  //   description: "Set the number of AI members and users for the discussion.",
  //   fields: [
  //     {
  //       component: "TextInput",
  //       label: "Number of AI Members",
  //       id: "aiModelsCount",
  //       name: "aiModelsCount",
  //       type: "number",
  //     },
  //     {
  //       component: "TextInput",
  //       label: "Number of Users",
  //       id: "noOFUsers",
  //       name: "noOFUsers",
  //       type: "number",
  //       disabled: true,
  //     },
  //   ],
  // },
  {
    title: "AI Settings",
    description: "Configure the AI settings.",
    fields: [
      {
        component: "DropdownSelect",
        label: "AI Speech Mode",
        id: "aiSpeechMode",
        name: "aiSpeechMode",
        options: [
          { value: "automatic", label: "🗣️ Speak Automatically" },
          { value: "selection", label: "🎯 Speak When Selected" },
          { value: "periodic", label: "⏱️ Speak Periodically" },
        ],
        placeholder: "Select AI Speech Mode",
        required: true,
      },
      {
        component: "TextInput",
        label: "AI Speaks At Frequency",
        id: "aiSpeaksAtFrequency",
        name: "aiSpeaksAtFrequency",
        type: "number",
        placeholder: "Enter frequency",
        conditions: {
          disabledCondition: [
            {
              id: "aiSpeechMode",
              value: ["automatic", "selection"],
            },
          ],
          requiredCondition: [
            {
              id: "aiSpeechMode",
              value: ["periodic"],
            },
          ],
        },
        // validation: {
        //   validate(value) {
        //     return value?.length > 3;
        //   },
        //   error(value) {
        //     if (value?.length < 3) {
        //       return "Length should be greater than 3.";
        //     }
        //   },
        // },
      },
    ],
  },
  {
    title: "Discussion Settings",
    description: "Configure the discussion settings.",
    fields: [
      {
        component: "DropdownSelect",
        label: "Discussion Mode",
        id: "discussionMode",
        name: "discussionMode",
        placeholder: "Select discussion mode",
        required: true,
        options: [
          { value: "random", label: "🎲 Random - Make them obtain" },
          { value: "selection", label: "🎙️ Decide - You choose who speaks" },
          { value: "both", label: "🔄 Mix of both modes" },
        ],
      },
      // {
      //   component: "DropdownSelect",
      //   label: "Discussion Length Setting",
      //   id: "discussionLengthSetting",
      //   name: "discussionLengthSetting",
      //   placeholder: "Select length setting",
      //   options: [
      //     { value: "limit", label: "🔒 Limited" },
      //     { value: "noLimit", label: "🔓 No Limit" },
      //     { value: "onDiscussion", label: "🤝 Decide During Discussion" },
      //   ],
      // },
      // {
      //   component: "TextInput",
      //   label: "Discussion Length",
      //   id: "discussionLength",
      //   name: "discussionLength",
      //   type: "number",
      //   placeholder: "Enter the discussion length",
      //   conditions: {
      //     disabledCondition: [
      //       {
      //         id: "discussionLengthSetting",
      //         value: ["noLimit", "onDiscussion"],
      //       },
      //     ],
      //     requiredCondition: [
      //       {
      //         id: "discussionLengthSetting",
      //         value: ["limit"],
      //       },
      //     ],
      //   },
      // },
    ],
  },
  {
    title: "Points Settings",
    description: "Configure the points settings for each participant.",
    fields: [
      {
        component: "DropdownSelect",
        label: "Points Setting",
        id: "pointsSetting",
        name: "pointsSetting",
        placeholder: "Select points setting",
        options: [
          { value: "limit", label: "🔒 Limited" },
          { value: "noLimit", label: "🔓 No Limit" },
          { value: "range", label: "📊 Range" },
        ],
        required: true,
      },
      {
        component: "TextInput",
        label: "Min Points",
        id: "minPoints",
        name: "minPoints",
        type: "number",
        placeholder: "Enter minimum points",
        conditions: {
          disabledCondition: [
            {
              id: "pointsSetting",
              value: ["limit"],
            },
          ],
          requiredCondition: [
            {
              id: "pointsSetting",
              value: ["range"],
            },
          ],
        },
      },
      {
        component: "TextInput",
        label: "Max Points",
        id: "maxPoints",
        name: "maxPoints",
        type: "number",
        placeholder: "Enter maximum points",
        conditions: {
          disabledCondition: [
            {
              id: "pointsSetting",
              value: ["limit", "noLimit"],
            },
          ],
          requiredCondition: [
            {
              id: "pointsSetting",
              value: ["range"],
            },
          ],
        },
      },
      {
        component: "TextInput",
        label: "Points Per Participant",
        id: "pointsPerParticipant",
        name: "pointsPerParticipant",
        type: "number",
        placeholder: "Enter points per participant",
        conditions: {
          disabledCondition: [
            {
              id: "pointsSetting",
              value: ["range", "noLimit"],
            },
          ],
          requiredCondition: [
            {
              id: "pointsSetting",
              value: ["limit"],
            },
          ],
        },
      },
    ],
  },
  {
    title: "Conclusion Settings",
    description: "Configure the conclusion settings.",
    fields: [
      {
        component: "DropdownSelect",
        label: "Conclusion By",
        id: "conclusionBy",
        name: "conclusionBy",
        options: [
          { value: "ai", label: "🤖 AI" },
          { value: "participants", label: "👥 Participants" },
          { value: "both", label: "🔗 Both (AI + Participants)" },
        ],
        placeholder: "Select conclusion source",
        required: true,
      },
      {
        component: "DropdownSelect",
        label: "Conclusion Mode",
        id: "conclusionMode",
        name: "conclusionMode",
        options: [
          { value: "random", label: "🎲 Random - Make them obtain" },
          { value: "selection", label: "🎙️ Decide - You choose who speaks" },
          { value: "both", label: "🔄 Mix of both modes" },
        ],
        placeholder: "Select conclusion mode",
        required: true,
      },
      {
        component: "DropdownSelect",
        label: "Conclusion Length Setting",
        id: "conclusionLengthSetting",
        name: "conclusionLengthSetting",
        options: [
          { value: "limit", label: "🔒 Limited" },
          { value: "noLimit", label: "🔓 No Limit" },
          { value: "onDiscussion", label: "🤝 Decide During Discussion" },
        ],
        placeholder: "Select conclusion length setting",
      },
      {
        component: "TextInput",
        label: "Conclusion Length",
        id: "conclusionLength",
        name: "conclusionLength",
        type: "number",
        placeholder: "Enter conclusion length",
        conditions: {
          disabledCondition: [
            {
              id: "conclusionLengthSetting",
              value: ["noLimit", "onDiscussion"],
            },
          ],
          requiredCondition: [
            {
              id: "conclusionLengthSetting",
              value: ["limit"],
            },
          ],
        },
      },
    ],
  },

  {
    title: "Participants Settings",
    description: "Configure the participants settings.",
    fields: [
      {
        component: "Checkbox",
        label: "👥 Participant Access Own Conversation",
        id: "accessConversation",
        name: "accessConversation",
        type: "checkbox",
      },
      {
        component: "Checkbox",
        label: "🔄 Participant Access Others' Conversations",
        id: "accessOthersConversation",
        name: "accessOthersConversation",
        type: "checkbox",
      },
      {
        component: "Checkbox",
        label: "📝 Participant Access Own Feedback",
        id: "accessFeedback",
        name: "accessFeedback",
        type: "checkbox",
      },
      {
        component: "Checkbox",
        label: "👤 Participant Access Others' Feedback",
        id: "accessOthersFeedback",
        name: "accessOthersFeedback",
        type: "checkbox",
      },
      {
        component: "Checkbox",
        label: "🔒 Officials Access Participant Conversation",
        id: "accessParticipantConversation",
        name: "accessParticipantConversation",
        type: "checkbox",
      },
      {
        component: "Checkbox",
        label: "📊 Officials Access Participant Feedback",
        id: "accessParticipantFeedback",
        name: "accessParticipantFeedback",
        type: "checkbox",
      },
    ],
  },
  {
    title: "Mic Settings",
    description: "Configure the mic settings.",
    fields: [
      {
        component: "TextInput",
        label: "Mic Access Wait Time (Seconds)",
        id: "micAccessWaitTime",
        name: "micAccessWaitTime",
        type: "number",
      },
    ],
  },
];

export const AI_MEMBERS_FORM_DATA = [
  {
    title: "AI Members Details",
    description: "Provide the basic information about the discussion topic.",
    fields: [
      {
        component: "DropdownSelect",
        label: "Topic Setting",
        id: "aiMembers",
        name: "aiMembers",
        placeholder: "Select a setting",
        options: [
          { value: "random", label: "Select the AI Randomly" },
          { value: "select", label: "Let me choose the AI" },
        ],
      },
      {
        component: "TextInput",
        label: "Number of AI",
        id: "topic",
        name: "topic",
        placeholder: "Enter number of AI",
        conditions: {
          disabledCondition: [
            {
              id: "aiMembers",
              value: ["select"],
            },
          ],
        },
      },
    ],
  },
];

const LEVEL_OPTIONS = [
  { value: "high", label: "💪 High" },
  { value: "medium", label: "🤝 Medium" },
  { value: "low", label: "🤏 Low" },
];

export const AI_MODEL_FORM_DATA = [
  {
    title: "New AI Model",
    description: "Customize the AI model for the discussion.",
    fields: [
      {
        component: "TextInput",
        label: "Name",
        id: "name",
        name: "name",
        placeholder: "Enter AI name",
      },
      {
        component: "TextInput",
        label: "Avatar",
        id: "avatar",
        name: "avatar",
        type: "file",
      },
      {
        component: "DropdownSelect",
        label: "Gender",
        id: "gender",
        name: "gender",
        placeholder: "Select AI gender",
        options: [
          { value: "male", label: "👨 Male" },
          { value: "female", label: "👩 Female" },
        ],
      },
      {
        component: "DropdownSelect",
        label: "Tone",
        id: "tone",
        name: "tone",
        placeholder: "Select AI tone",
        options: [
          {
            label: "Collaborative",
            options: [
              { value: "supportive", label: "🤝 Supportive" },
              { value: "empathetic", label: "💖 Empathetic" },
              { value: "motivational", label: "💪 Motivational" },
              { value: "friendly", label: "🤗 Friendly" },
              { value: "cheerful", label: "😊 Cheerful" },
              { value: "encouraging", label: "👍 Encouraging" },
              { value: "cooperative", label: "🤝 Cooperative" },
            ],
          },
          {
            label: "Neutral",
            options: [
              { value: "neutral", label: "⚖️ Neutral" },
              { value: "professional", label: "🧑‍💼 Professional" },
              { value: "informative", label: "📚 Informative" },
              { value: "calm", label: "😌 Calm" },
              { value: "clear", label: "🔍 Clear" },
              { value: "objective", label: "🎯 Objective" },
            ],
          },
          {
            label: "Challenging",
            options: [
              { value: "assertive", label: "💥 Assertive" },
              { value: "critical", label: "🧐 Critical" },
              { value: "oppositional", label: "💣 Oppositional" },
              { value: "provocative", label: "🔥 Provocative" },
              { value: "disruptive", label: "⚡ Disruptive" },
              { value: "skeptical", label: "🤔 Skeptical" },
              { value: "inquisitive", label: "🕵️‍♂️ Inquisitive" },
            ],
          },
          {
            label: "Formal",
            options: [
              { value: "formal", label: "📜 Formal" },
              { value: "authoritative", label: "📣 Authoritative" },
              { value: "professional", label: "🧑‍💼 Professional" },
              { value: "respectful", label: "🤝 Respectful" },
              { value: "diplomatic", label: "🕊️ Diplomatic" },
              { value: "structured", label: "🏢 Structured" },
            ],
          },
          {
            label: "Casual",
            options: [
              { value: "casual", label: "😎 Casual" },
              { value: "humorous", label: "😂 Humorous" },
              { value: "sarcastic", label: "😏 Sarcastic" },
              { value: "relaxed", label: "😌 Relaxed" },
              { value: "playful", label: "🎈 Playful" },
              { value: "conversational", label: "🗣️ Conversational" },
            ],
          },
          {
            label: "Emotional",
            options: [
              { value: "passionate", label: "❤️ Passionate" },
              { value: "excited", label: "🤩 Excited" },
              { value: "enthusiastic", label: "🎉 Enthusiastic" },
              { value: "sympathetic", label: "🤗 Sympathetic" },
              { value: "compassionate", label: "💗 Compassionate" },
              { value: "anxious", label: "😟 Anxious" },
              { value: "frustrated", label: "😤 Frustrated" },
            ],
          },
          {
            label: "Intellectual",
            options: [
              { value: "analytical", label: "🧠 Analytical" },
              { value: "logical", label: "🧠 Logical" },
              { value: "rational", label: "🔍 Rational" },
              { value: "thoughtful", label: "🤔 Thoughtful" },
              { value: "insightful", label: "💡 Insightful" },
              { value: "reflective", label: "🧘 Reflective" },
            ],
          },
        ],
      },
    ],
  },
  {
    title: "AI Personality",
    description: "Define the personality traits of the AI.",
    fields: [
      {
        component: "DropdownSelect",
        label: "Assertiveness",
        id: "assertiveness",
        name: "assertiveness",
        placeholder: "Select assertiveness level",
        options: LEVEL_OPTIONS,
      },
      {
        component: "DropdownSelect",
        label: "Agreeableness",
        id: "agreeableness",
        name: "agreeableness",
        placeholder: "Select agreeableness level",
        options: LEVEL_OPTIONS,
      },
      {
        component: "DropdownSelect",
        label: "Openness",
        id: "openness",
        name: "openness",
        placeholder: "Select openness level",
        options: LEVEL_OPTIONS,
      },
      {
        component: "DropdownSelect",
        label: "Conscientiousness",
        id: "conscientiousness",
        name: "conscientiousness",
        placeholder: "Select conscientiousness level",
        options: LEVEL_OPTIONS,
      },
      {
        component: "DropdownSelect",
        label: "Emotional Stability",
        id: "emotionalStability",
        name: "emotionalStability",
        placeholder: "Select emotional stability level",
        options: [
          { value: "calm", label: "😌 Calm" },
          { value: "reactive", label: "😲 Reactive" },
        ],
      },
    ],
  },
  {
    title: "Emotional Expression",
    description: "Define the emotional expression of the AI.",
    fields: [
      {
        component: "DropdownSelect",
        label: "Emotion Types",
        id: "emotionTypes",
        name: "emotionTypes",
        placeholder: "Select emotion types",
        options: [
          {
            label: "Positive Emotions",
            options: [
              { value: "happiness", label: "😊 Happiness" },
              { value: "empathy", label: "🤗 Empathy" },
              { value: "excitement", label: "🤩 Excitement" },
            ],
          },
          {
            label: "Neutral Emotions",
            options: [{ value: "surprise", label: "😮 Surprise" }],
          },
          {
            label: "Negative Emotions",
            options: [
              { value: "sadness", label: "😢 Sadness" },
              { value: "anger", label: "😡 Anger" },
              { value: "fear", label: "😱 Fear" },
              { value: "disgust", label: "🤢 Disgust" },
              { value: "sarcasm", label: "😏 Sarcasm" },
              { value: "frustration", label: "😤 Frustration" },
              { value: "disappointment", label: "😞 Disappointment" },
            ],
          },
        ],
      },
      {
        component: "DropdownSelect",
        label: "Empathy Level",
        id: "empathyLevel",
        name: "empathyLevel",
        placeholder: "Select empathy level",
        options: [
          { value: "high", label: "🤗 High" },
          { value: "medium", label: "🤝 Medium" },
          { value: "low", label: "🤏 Low" },
        ],
      },
    ],
  },
  {
    title: "Role in Discussion",
    description: "Define the role of the AI in the discussion.",
    fields: [
      {
        component: "DropdownSelect",
        label: "Role",
        id: "role",
        name: "role",
        placeholder: "Select AI role",
        options: [
          { value: "moderator", label: "👮 Moderator" },
          { value: "devilsAdvocate", label: "😈 Devil's Advocate" },
          { value: "factChecker", label: "🔍 Fact-Checker" },
          { value: "supporter", label: "🤝 Supporter" },
        ],
      },
    ],
  },
  {
    title: "Response Style",
    description: "Define the response style of the AI.",
    fields: [
      {
        component: "DropdownSelect",
        label: "Response Style",
        id: "responseStyle",
        name: "responseStyle",
        placeholder: "Select response style",
        options: [
          { value: "concise", label: "📝 Concise" },
          { value: "detailed", label: "📚 Detailed" },
          { value: "conversational", label: "🗣️ Conversational" },
        ],
      },
      {
        component: "DropdownSelect",
        label: "Response Type",
        id: "responseType",
        name: "responseType",
        placeholder: "Select response type",
        options: [
          { value: "agreeDisagree", label: "👍👎 Agree/Disagree Mode" },
          { value: "opposing", label: "😈 Opposing Mode" },
          { value: "supporting", label: "🤝 Supporting Mode" },
        ],
      },
    ],
  },
  {
    title: "AI Argumentation Style",
    description: "Configure the argumentation style settings for the AI.",
    fields: [
      {
        component: "DropdownSelect",
        label: "Logic vs Emotion",
        id: "logicVsEmotion",
        name: "logicVsEmotion",
        placeholder: "Select logic vs emotion",
        options: [
          { value: "logical", label: "🧠 Logical" },
          { value: "emotional", label: "❤️ Emotional" },
        ],
      },
      {
        component: "DropdownSelect",
        label: "Debate Mode",
        id: "debateMode",
        name: "debateMode",
        placeholder: "Select debate mode",
        options: [
          { value: "formalDebater", label: "👔 Formal Debater" },
          {
            value: "casualConversationalist",
            label: "🗣️ Casual Conversationalist",
          },
        ],
      },
      {
        component: "DropdownSelect",
        label: "Complexity Level",
        id: "complexityLevel",
        name: "complexityLevel",
        placeholder: "Select complexity level",
        options: [
          { value: "simple", label: "📚 Simple" },
          { value: "complex", label: "📜 Complex" },
        ],
      },
    ],
  },
  {
    title: "AI Interaction with Users",
    description: "Configure the interaction settings for the AI with users.",
    fields: [
      {
        component: "DropdownSelect",
        label: "Question Type Preference",
        id: "questionTypePreference",
        name: "questionTypePreference",
        placeholder: "Select question type preference",
        options: [
          { value: "openEnded", label: "💬 Open-Ended Questions" },
          { value: "factual", label: "📊 Factual Inquiries" },
          { value: "challenging", label: "🧩 Challenging Questions" },
        ],
      },
      {
        component: "DropdownSelect",
        label: "Encouragement Style",
        id: "encouragementStyle",
        name: "encouragementStyle",
        placeholder: "Select encouragement style",
        options: [
          { value: "supportive", label: "🤗 Supportive Encouragement" },
          { value: "neutral", label: "😐 Neutral Encouragement" },
          { value: "challenging", label: "🧩 Challenging Encouragement" },
        ],
      },
    ],
  },
  {
    title: "AI’s Stance on Discussion Points",
    description: "Configure the AI’s stance on discussion points.",
    fields: [
      {
        component: "DropdownSelect",
        label: "Agree vs. Disagree",
        id: "agreeDisagree",
        name: "agreeDisagree",
        placeholder: "Select agree vs. disagree",
        options: [
          { value: "agree", label: "👍 Agree" },
          { value: "disagree", label: "👎 Disagree" },
          { value: "balanced", label: "⚖️ Balanced" },
        ],
      },
      {
        component: "DropdownSelect",
        label: "Contradiction Levels",
        id: "contradictionLevels",
        name: "contradictionLevels",
        placeholder: "Select contradiction levels",
        options: [
          { value: "high", label: "😲 High" },
          { value: "medium", label: "😐 Medium" },
          { value: "low", label: "😌 Low" },
        ],
      },
      {
        component: "DropdownSelect",
        label: "Supportive Responses",
        id: "supportiveResponses",
        name: "supportiveResponses",
        placeholder: "Select supportive responses level",
        options: [
          { value: "high", label: "🤗 High Support" },
          { value: "medium", label: "🤝 Medium Support" },
          { value: "low", label: "🤏 Low Support" },
        ],
      },
    ],
  },
  {
    title: "AI’s Role in the Discussion",
    description: "Configure the AI’s role in the discussion.",
    fields: [
      {
        component: "DropdownSelect",
        label: "Participant Level",
        id: "participantLevel",
        name: "participantLevel",
        placeholder: "Select participant level",
        options: [
          { value: "active", label: "🗣️ Active Participant" },
          { value: "moderatorObserver", label: "👁️ Moderator/Observer" },
          { value: "devilsAdvocate", label: "😈 Devil’s Advocate" },
        ],
      },
      {
        component: "DropdownSelect",
        label: "Frequency of Participation",
        id: "frequencyOfParticipation",
        name: "frequencyOfParticipation",
        placeholder: "Select frequency of participation",
        options: [
          { value: "frequent", label: "🗣️ Frequent" },
          { value: "occasional", label: "🕒 Occasional" },
          { value: "rare", label: "😶 Rare" },
        ],
      },
    ],
  },
];

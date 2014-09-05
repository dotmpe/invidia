#
# JS definition for Sugar.RNG
#
# use { element: [] }
#
#
module.exports = [
  grammar: [

    start: ref: @name: 'sugermeta'
    ,

    @name: 'sugarmeta'
    define: [
      element: [
        choice: [
          ref: @name: 'dictionary',
          ref: @name: 'viewdefs'
        ] ] ],

    @name: 'dictionary',
    define: [
    ],

    @name: 'viewdefs',
    define: [
      @name: 'viewdefs'
      element: []
    ],

    @name: 'dictionary',
    define: [
      @name: 'dictionary'
      element: [
        choice: [
          ref: @name: 'account',
          ref: @name: 'contact',
          ref: @name: 'lead'
        ] ] ],

    @name: 'account',
    define: [
      @name: 'Account',
      element: [
        @name: 'fields',
        element: [
          @name: 'id',
          attribute: []
        ],
        element: [
          @name: 'name',
          attribute: []
        ],
        element: [
          @name: 'description',
          attribute: []
        ],
        element: [
          @name: 'date_entered',
          attribute: []
        ] ] ],

    define: [
      @name: 'Accounts',
      element: [
        @name: 'Accounts',
        zeroOrMore: [
          ref: @name: 'name'
        ] ] ]
  ]
]

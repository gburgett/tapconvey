import 'mocha'
import * as React from 'react'
import { expect } from 'chai'
import { shallow } from 'enzyme'

import { App } from './app'

var jsdom = require('mocha-jsdom')

describe('<App />', () => {

  jsdom()

  it('renders the app message', () => {
    const app = shallow(<App />)

    expect(app.find('h1').text()).to.equal('This is the app!')
  })
})

// @flow

import * as React from 'react';
import { Component } from 'react-simplified';
import {cancelledEvent} from '../src/Containers/Event/Components/cancelledEvent.js';
import { shallow, mount } from 'enzyme';

//jest.mock('../src/services.js');

describe('EventList test', () => {
    const wrapper = shallow(<cancelledEvent />);

    it('initially', () => {
        let instance = cancelledEvent.instance();
        expect(typeof instance).toEqual('object');
        if (instance) expect(instance.state["event"]).toEqual([]);
    });
});

/**
 *  Orbita, Inc. (TM)
 *  Copyright (c) 2016
 */
(function () {
  'use strict';

  /**
   * Global dependency
   */
  var mongoose = require('mongoose'),
    _ = require('lodash'),
    moment = require('moment'),
    async = require('async'),
    bebaioPaginate = require('../utilities/mongo-paginate'),
    textSearch = require('mongoose-text-search');

// Todo Need to refactor the recurrence Schema after our discussion
  var recurrenceSchema1 = mongoose.Schema({
    patterns: {
      daily: {interval: {type: Number}, everyWeekDays: {type: Boolean, default: false}},
      weekly: {interval: {type: Number}, weekDays: []}, // Todo Need to refactor the weekDays as (number or days name or short name of week days)
      monthly: {
        everyXDayXMonthBased: {dayX: {type: Number}, interval: {type: Number}},
        everyXWeekXDayXMonthBased: {dayX: {type: Number}, weekX: {type: Number}, interval: {type: Number}}
      },
      yearly: {
        everyXDayXMonthXYear: {dayX: {type: Number}, monthX: {type: Number}, interval: {type: Number}},
        everyXDayXWeekXMonthXYear: {
          dayX: {type: Number},
          weekX: {type: Number},
          monthX: {type: Number},
          interval: {type: Number}
        }
      }
    },
    range: {
      startDate: {type: Date},
      noEndDate: {},
      endAfter: {},
      endBy: {}
    }
  });
  var categorySchema = {
    type: {type: String, enum: ['event', 'task', 'notes', 'birthday', 'yearly']},
    childType: String,
    child: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'category.childType'
    }
  };

  var recurrenceSchema = mongoose.Schema({
    patterns: {
      dayOfMonth: {type: Number},
      weekOfMonth: {type: Number},
      daysOfWeek: [{type: Number}],
      daysInWeek: [{type: Number}],
      monthInYear: {type: Number},
      interval: {type: Number},
      recurrenceType: {type: String, enum: ['none', 'daily', 'weekly', 'monthly', 'yearly']}
    },
    range: {
      startDate: {type: Date},
      endDate: {type: Date},
      occurrencesCount: {type: Number},
      rangeType: {type: String, enum: ['enddate']}
    }
  });

  var sharedSchema = {
    participants: {type: [{type: mongoose.Schema.ObjectId, ref: 'User'}]},
    title: {type: String},
    description: {type: String}, // New fields
    startDate: {type: Date},
    endDate: {type: Date},
    isAllDay: {type: Boolean},
    location: {type: String},
    reminder: [{type: Date}],
    frequency: recurrenceSchema,
    category: categorySchema,
    isDeleted: {type: Boolean, default: false},
    createdBy: {type: mongoose.Schema.ObjectId, ref: 'User'},
    attributes: {},
    //childType: String,
    //child: {
    //  type: mongoose.Schema.Types.ObjectId,
    //  refPath: 'childType'
    //}
  };

  var taskSchema = mongoose.Schema(
    _.assign({}, sharedSchema,
      {
        isAllDay: {type: Boolean, default: true}, //Overwrite the existing data from common shared schema
        status: {type: String},
        priority: {type: String},
        percentageOfComplete: {type: Number},
        keepMeTask: {type: Boolean, default: false},
        KeepUpdatesOfCompletion: {type: Boolean, default: false}
      }),
    {
      timestamps: {updatedAt: 'modifiedAt'}
    }
  );

  var calendarEventSchema = mongoose.Schema(
    //participants: [],
    //title: {type: String},
    //description: {type: String}, // New fields
    //startDate: {type: Number},
    //endDate: {type: Number},
    //isAllDay: {type: Boolean, default: true},
    //location: {type: String},
    //reminder: {type: Date},
    //
    //isDeleted: {type: Boolean, default: false},
    //createdBy: {},
    //attributes: {}

    _.assign({}, sharedSchema, {}),
    {
      timestamps: {updatedAt: 'modifiedAt'}
    }
  );
  taskSchema.plugin(bebaioPaginate);
  taskSchema.plugin(textSearch);
  var Tasks = mongoose.model('Tasks', taskSchema);

  calendarEventSchema.plugin(bebaioPaginate);
  calendarEventSchema.plugin(textSearch);
  var CalendarEvent = mongoose.model('CalendarEvent', calendarEventSchema);
  //Tasks.remove(); CalendarEvent.remove();
  //Tasks.create({title: 'Log blood Pressure', category: { type: 'task', childType: 'User', child: '582f49d360bcab382d638669'}},function(err, res){
  //  Tasks.find({}).populate('category.child').exec(function(err, res){ if(err){ console.log('============', err);}
  //    console.log('------------', res);
  //  });
  //});

  function startTest() {
    //var failDyn = 0, failRef = 0, i = 0, result= [];
    //_.transform([2, 3, 4], function(result, n) {
    //  console.log('[[[[[[', n, ']]]]]]]]');
    //  //result.push(n *= n); console.log('[[[[[[', n, ']]]]]]]]');
    //  return n % 2 == 0;
    //});
    //
    //var users = {
    //  'data': [{ 'user': 'barney' }, { 'user': 'fred' }]
    //};
    //
    //var ages = {
    //  'data': [{ 'age': ''}, { 'age': 40 }]
    //};
    //
    //console.log(_.merge(users, ages));
    //
    //var today = moment().startOf('day');
    //var tomorrow = moment(today).add(1, 'days');
    //console.log(today, tomorrow);
    var nowTime = new Date().toTimeString();
    console.log(nowTime);
    console.log(moment.utc().format());
    console.log(moment.utc().format("HH:mm"));
    console.log(moment.utc().format("HHmm"));

    async.waterfall([
      function(cb1){
        Tasks.remove();
        var User = mongoose.model('User');
        User.findOne({username: 'bill'}, cb1);
      },
      function(user, cb2){
        if (user && user._id){
          Tasks.create({title: 'Log blood Pressure', category: { type: 'task', childType: 'User', child: user._id}},cb2);
        }
      },
      function(tasks, cb3){
        var User = mongoose.model('Tasks');
        Tasks.findOne({})
          //.select('category.child')
          .populate('category.child', 'username')
          //.populate({
          //  path: 'category.child',
          //  select: '_id avatarSrc firstName lastName username phone dateOfBirth'
          //})
          //.exec(function(err, ress){
          //  console.log('***********************************');
          //  console.log('ress', ress);
          //  console.log('*********************************');
          //  ress.populate('category.child',cb3);
          //}); //.populate('category.child')
          .exec(cb3);
      }
    ],
      function(err, res){
        console.log('err-------------', (err? err: 'No error'));
        console.log('==================================');
        console.log('Res', res);
        console.log('==================================');
      }
    );
  }
  startTest();
  //CalendarEvent.create({title: 'testCalendarevent'});
}());
/************************************************************************************/
//(function () {
//  'use strict';
//
//  /**
//   * Global dependency
//   */
//  var mongoose = require('mongoose'),
//    _ = require('lodash'),
//    async = require('async'),
//    bebaioPaginate = require('../utilities/mongo-paginate'),
//    textSearch = require('mongoose-text-search');
//  var ParentSchema = new mongoose.Schema({
//    childType: String,
//    child: {
//      type: mongoose.Schema.Types.ObjectId,
//      refPath: 'childType'
//    },
//    regRef: {
//      type: mongoose.Schema.Types.ObjectId,
//      ref: 'child3'
//    }
//  });
//
//  var Child1Schema = new mongoose.Schema({
//    field: String
//  });
//
//  var Child2Schema = new mongoose.Schema({
//    anotherField: String
//  });
//
//  var Child3Schema = new mongoose.Schema({
//    thirdField: String
//  });
//
//  var Parent = mongoose.model('parent', ParentSchema);
//  var Child1 = mongoose.model('child1', Child1Schema);
//  var Child2 = mongoose.model('child2', Child2Schema);
//  var Child3 = mongoose.model('child3', Child3Schema);
//
//  Child3.create({thirdField: 'ref'}, function (err, refDoc) {
//    Child1.create({field: 'test'}, function (err, child1Doc) {
//      Parent.create({childType: 'child1', child: child1Doc._id, regRef: refDoc._id}, function (err) {
//        Child2.create({anotherField: 'test another'}, function (err, child2Doc) {
//          Parent.create({childType: 'child2', regRef: refDoc._id}, function (err) {
//            startTest();
//          });
//        });
//      });
//    });
//  });
//
//  function startTest() {
//    var failDyn = 0, failRef = 0, i = 0, result= [];
//
//    async.whilst(
//      function () {
//        return i < 2000;
//      },
//      function (cb) {
//        i++; result =[];
//          Parent.find({}).populate('child regRef').exec(function (err, docs) {
//          docs.forEach(function (doc) { //console.log(doc.child);
//            result.push(doc);
//            if (doc.child === null) failDyn++;
//            if (doc.regRef === null) failRef++;
//          });
//          cb();
//        });
//      },
//      function () {
//        console.log('Dynamic ref failures', failDyn);
//        console.log('Reg ref failures', failRef);
//        console.log('REsul child Data in each doc', result);
//      }
//    );
//  }
//}());
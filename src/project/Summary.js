import React from 'react';
import ProjectService from '../services/ProjectService';
import CalendarHeatmap from 'react-calendar-heatmap';
import { Doughnut } from 'react-chartjs-2';
import 'react-calendar-heatmap/dist/styles.css';
import './Summary.scss';
import moment from 'moment';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';

class Summary extends React.Component{
  constructor(){
    super();
    this.state = {
      loaded: false
    };
  }

  componentDidMount(){
    ProjectService.summary(this.props.project.id)
    .then(res => {
      this.setState({
        calendarHeatMap: this.processCalendarHeatMap(res.lastDaysActivity),
        executionsPercentageUsers: this.processExecutionsPercentageUsers(res.executionsPercentageUsers),
        loaded: true
      });
    });
  }

  processExecutionsPercentageUsers = rawData => {
    if(rawData.length === 0){
      return null;
    }
    let labels = rawData.map(u => u.email);
    let percentages = rawData.map(u => u.executionsPercentage);

    return {
      data: {
        labels,
        datasets: [{
          data: percentages,
          backgroundColor: [ // TODO: Add more colors, or find a way to do it dynamically (i.e. automatically).
          '#FF6384',
          '#36A2EB',
          '#FFCE56'
          ],
          hoverBackgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56'
          ]
        }]
      },
      options: {
        tooltips: {
          callbacks: {
            label: function(tooltipItem, data) {
              return data['labels'][tooltipItem['index']] + ': ' + data['datasets'][0]['data'][tooltipItem['index']] + '%';
            }
          }
        }
      }
    }
  }

  processCalendarHeatMap = rawData => {
    if(rawData.length === 0){
      return null;
    }
    let result = {};
    result.values = rawData;
    result.endDate = rawData[rawData.length-1].date;
    result.startDate = moment(result.endDate).subtract(6, 'months').format('YYYY-MM-DD')
    let allCounts = rawData.map(obj => obj.count);
    let max = allCounts.reduce((x, y) => Math.max(x , y), 0);
    let avg = allCounts.reduce((x, y) => x + y, 0) / allCounts.length;
    
    let scales = [
      avg / 2,
      avg,
      avg + ((max - avg) / 2)
    ];
    
    result.classForValue = value => {
      if (!value) {
        return 'color-empty';
      }
      // TODO: This can be automatized more, for more classes.
      let count = value.count;
      let color;
      if(count < scales[0]){
        color = 1;
      } else if(count < scales[1]){
        color = 2;
      } else if(count < scales[2]){
        color = 3;
      } else {
        color = 4;
      }
      return `color-scale-${color}`;
    };

    // TODO: Tooltip doesn't work. It seems it's a bug that happens when using react-bootstrap.
    return result;
  }

  render(){
    if(!this.state.loaded){
      return <span>Loading summary for <b>{this.props.project.name}</b></span>;
    }

    // <div>Summary</div>
    // <div>Number of users</div>
    // <div>List (summary of views)</div>
    // <div>Report of errors, and executions</div>
    // <div>Graphs that show some other data</div>
    // <div>Some of the important settings</div>

    return(
      <Container fluid>
        <Row>
          <Col>
            <h3>Summary</h3>
          </Col>
        </Row>
        <Row>
          <Col lg={6} xl={4} className='grid-square-widget'>
            <div className='grid-square-widget-content'>
              {this.state.calendarHeatMap ? <CalendarHeatmap {...this.state.calendarHeatMap}/> : ''}
            </div>
          </Col>
          <Col lg={6} xl={4} className='grid-square-widget'>
            <div className='grid-square-widget-content'>
              {this.state.executionsPercentageUsers ? <Doughnut {...this.state.executionsPercentageUsers} /> : ''}
            </div>
          </Col>
          <Col lg={12} xl={4} className='grid-square-widget'>
            <div className='grid-square-widget-content'>
              <h4>Other reports</h4><i>Nothing to show here.</i>
            </div>
          </Col>
          <Col lg={12} xl={12} className='grid-square-widget'>
            <div className='grid-square-widget-content'>
              <h4>Most used queries</h4><i>Nothing to show here.</i>
            </div>
          </Col>
        </Row>
      </Container>
    );
  }
}

export default Summary;

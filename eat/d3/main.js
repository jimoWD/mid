//Load Data
d3.csv('data/movies.csv',type).then(
    res=>{
        ready(res);
        //console.log(res);
    }
)

//Main
function ready(movies){
    const moviesClean = filterData(movies);
    const barChartData = prepareBarChartData(moviesClean).sort(
        (a,b)=>{
            return d3.descending(a.revenue, b.revenue);
        }
    );
    console.log(barChartData);
    setupCanvas(barChartData);

    
}
    

//Data utilities
//遇到NA就設定為undefined, 要不然就維持原本的字串
const parseNA = string => (string === 'NA' ? undefined : string);
//日期處理
const parseDate = string => d3.timeParse('%Y-%m-%d')(string);

//Data selection
function filterData(data){
    return data.filter(
        d => {
            return(
                d.release_year > 1999 && d.release_year < 2010 &&
                d.revenue > 0 &&
                d.budget > 0 &&
                d.genre &&
                d.title
            );
        }
    );
}

function type(d){
    const date = parseDate(d.release_date);
    return {
        budget:+d.budget,
        genre:parseNA(d.genre),
        genres:JSON.parse(d.genres).map(d=>d.name),
        homepage:parseNA(d.homepage),
        id:+d.id,
        imdb_id:parseNA(d.imdb_id),
        original_language:parseNA(d.original_language),
        overview:parseNA(d.overview),
        popularity:+d.popularity,
        poster_path:parseNA(d.poster_path),
        production_countries:JSON.parse(d.production_countries),
        release_date:date,
        release_year:date.getFullYear(),
        revenue:+d.revenue,
        runtime:+d.runtime,
        tagline:parseNA(d.tagline),
        title:parseNA(d.title),
        vote_average:+d.vote_average,
        vote_count:+d.vote_count,
    }
}

function prepareBarChartData(data){
    console.log(data);
    const dataMap = d3.rollup(
        data,
        v => d3.sum(v, leaf => leaf.revenue), //將revenue加總
        d => d.genre //依電影分類groupby
    );
    const dataArray = Array.from(dataMap, d=>({genre:d[0], revenue:d[1]}));
    return dataArray;
}

function setupCanvas(barChartData){
    const svg_width = 400;
    const svg_height = 500;
    const chart_margin = {top:80,right:40,bottom:40,left:80};
    const chart_width = svg_width - (chart_margin.left + chart_margin.right);
    const chart_height = svg_height - (chart_margin.top + chart_margin.bottom);
    const this_svg = d3.select('.bar-chart-container').append('svg')
    .attr('width', svg_width).attr('height',svg_height)
    .append('g')
    .attr('transform',`translate(${chart_margin.left},${chart_margin.top})`);
    //scale
    //V1.d3.extent find the max & min in revenue
    const xExtent = d3.extent(barChartData, d=>d.revenue);
    const xScale_v1 = d3.scaleLinear().domain(xExtent).range([0,chart_width]);
    //V2.0 ~ max
    const xMax = d3.max(barChartData, d=>d.revenue);
    const xScale_v2 = d3.scaleLinear().domain([0, xMax]).range([0,chart_width]);
    //V3.Short writing for v2
    const xScale_v3 = d3.scaleLinear([0,xMax],[0, chart_width]);
    //垂直空間的分配 - 平均分布給各種類
    const yScale = d3.scaleBand().domain(barChartData.map(d=>d.genre))
    .rangeRound([0, chart_height])
    .paddingInner(0.25);

    //Draw bars
    const bars = this_svg.selectAll('.bar')
    .data(barChartData)
    .enter()
    .append('rect')
    .attr('class','bar')
    .attr('x',0)
    .attr('y',d=>yScale(d.genre))
    .attr('width',d=>xScale_v3(d.revenue))
    .attr('height',yScale.bandwidth())
    .style('fill','dodgerblue')

    //Draw header
    const header = this_svg.append('g').attr('class','bar-header')
    .attr('transform',`translate(0,${-chart_margin.top/2})`)
    .append('text');
    header.append('tspan').text('Total revenue by genre in $US');
    header.append('tspan').text('Years:2000-2009')
    .attr('x',0).attr('y',20).style('font-size','0.8em').style('fill','#555');

    //tickSizeInner : the length of the tick lines
//tickSizeOuter : the length of the square ends of the domain path
    const xAxis = d3.axisTop(xScale_v3)
    .tickFormat(formatTicks)
    .tickSizeInner(-chart_height)
    .tickSizeOuter(0);
    const xAxisDraw = this_svg.append('g')
    .attr('class','x axis')
    .call(xAxis);
    const yAxis = d3.axisLeft(yScale).tickSize(0);
    const yAxisDraw = this_svg.append('g')
    .attr('class','y axis')
    .call(yAxis);
    yAxisDraw.selectAll('text').attr('dx','-0.6em');
}




function formatTicks(d){
    return d3.format('~s')(d)
    .replace('M','mil')
    .replace('G',
    'bil')
    .replace('T','tri')
}



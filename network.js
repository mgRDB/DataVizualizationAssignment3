function simulate(data,svg)
{
    const width = parseInt(svg.attr("viewBox").split(' ')[2])
    const height = parseInt(svg.attr("viewBox").split(' ')[3])
    const main_group = svg.append("g")
        .attr("transform", "translate(0, 50)")

   //calculate degree of the nodes:
    let node_degree={}; //initiate an object
   d3.map(data.links, (d)=>{
       if(d.source in node_degree)
       {
           node_degree[d.source]++
       }
       else{
           node_degree[d.source]=0
       }
       if(d.target in node_degree)
       {
           node_degree[d.target]++
       }
       else{
           node_degree[d.target]=0
       }
   })

   const tooltip = d3.select("#tooltip");

    const scale_radius = d3.scaleSqrt()
        .domain(d3.extent(Object.values(node_degree)))
        .range([3,12])

    const color = d3.scaleOrdinal([1,2,3,4,5,6,7,8,9,10],d3.schemeCategory10)
        .unknown("#A9A9A9");
    const link_elements = main_group.append("g")
        .attr('transform',`translate(${width/2},${height/2})`)
        .selectAll(".line")
        .data(data.links)
        .enter()
        .append("line")
    const node_elements = main_group.append("g")
        .attr('transform', `translate(${width / 2},${height / 2})`)
        .selectAll(".circle")
        .data(data.nodes)
        .enter()
        .append('g')
        .attr("class",function (d){return "gr_"+d.Group.toString()})
        .on("mouseenter",function (d,data){
            node_elements.classed("inactive",true)
            console.log(data.Country)
            d3.selectAll("."+"gr_"+data.Group.toString()).classed("inactive",false)
        })
        .on("mouseleave", (d,data)=>{
            d3.selectAll(".inactive").classed("inactive",false)
        })
        .on("click", (d,data)=>{
            tooltip.html("<strong>Author: </strong>" + data.Name + "<br><br>" +
            "<strong>Author ID: </strong>" + data.id + "<br><br>" +
            "<strong>Affiliation: </strong>" + data.Affiliation)
        })
    node_elements.append("circle")
        .attr("r",  (d,i)=>{
            if(node_degree[d.id]!==undefined) {
                return scale_radius(node_degree[d.id])
            } else {
                return scale_radius(0)
            }
        })
        .attr("fill",  d=> color(d.Group))

    let ForceSimulation = d3.forceSimulation(data.nodes)
        .force("collide",
            d3.forceCollide().radius((d,i)=>{return scale_radius(node_degree[i])*1.2}))
        .force("x", d3.forceX())
        .force("y", d3.forceY())
        .force("charge", d3.forceManyBody())
        .force("link",d3.forceLink(data.links)
            .id(d=>d.id)
            .distance(20)
        )
        .on("tick", ticked);

    function ticked()
    {
    node_elements
        .attr('transform', (d)=>`translate(${d.x},${d.y})`)
        link_elements
            .attr("x1",d=>d.source.x)
            .attr("x2",d=>d.target.x)
            .attr("y1",d=>d.source.y)
            .attr("y2",d=>d.target.y)

        }

    document.addEventListener("input",e=>{
            const tagId = e.target.id;
            const value = e.target.value
            switch (tagId){
                case "forceManyBody":
                    ForceSimulation.force("charge").strength(value)
                    break
                case "forceLink":
                    ForceSimulation.force("link").distance(value)
                    break
                case "forceCollide":
                    ForceSimulation.force("collide").radius(value)
                    break
            }
            ForceSimulation.alpha(1).restart()

        })

    svg.call(d3.zoom()
        .extent([[0, 0], [width, height]])
        .scaleExtent([.5, 8])
        .on("zoom", zoomed));
    function zoomed({transform}) {
        main_group.attr("transform", transform);
    }
}

import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { Employee } from '../types';

interface OrgMindMapProps {
  employees: Employee[];
}

const OrgMindMap: React.FC<OrgMindMapProps> = ({ employees }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || employees.length === 0) return;

    // Clear previous SVG
    d3.select(svgRef.current).selectAll("*").remove();

    const margin = { top: 40, right: 160, bottom: 40, left: 160 };
    const width = 1000 - margin.left - margin.right;
    const height = 800 - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current)
      .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    try {
      // 1. Filter employees to ensure hierarchy integrity
      // Only keep employees whose managers actually exist, or who are roots
      const validIds = new Set(employees.map(e => e.id));
      const hierarchyReadyEmployees = employees.map(e => ({
        ...e,
        // If manager doesn't exist in current list, treat as root to avoid stratify error
        managerId: (e.managerId && validIds.has(e.managerId)) ? e.managerId : undefined
      }));

      // 2. Handle Multiple Roots (the "multiple roots" fix)
      // D3 stratify requires exactly one root. If we have multiple (e.g. 2 CEOs or orphans), 
      // we wrap them in a virtual "Company" node.
      const roots = hierarchyReadyEmployees.filter(e => !e.managerId);
      
      let root;
      if (roots.length > 1) {
        const virtualRoot = { 
          id: 'virtual_root', 
          name: 'ZenHR Organization', 
          role: 'All Departments', 
          isVirtual: true 
        };
        const dataWithVirtual = [
          ...hierarchyReadyEmployees.map(e => ({
            ...e,
            managerId: e.managerId || 'virtual_root'
          })),
          virtualRoot
        ];
        root = d3.stratify<any>()
          .id(d => d.id)
          .parentId(d => d.managerId)(dataWithVirtual);
      } else {
        root = d3.stratify<any>()
          .id(d => d.id)
          .parentId(d => d.managerId)(hierarchyReadyEmployees);
      }

      // 3. Layout computation
      const treeLayout = d3.tree<any>().size([height, width]);
      const treeData = treeLayout(root);

      // 4. Drawing Links
      svg.selectAll(".link")
        .data(treeData.links())
        .enter().append("path")
        .attr("class", "link")
        .attr("fill", "none")
        .attr("stroke", "#e2e8f0")
        .attr("stroke-width", "2px")
        .attr("d", d3.linkHorizontal()
          .x((d: any) => d.y)
          .y((d: any) => d.x) as any);

      // 5. Drawing Nodes
      const node = svg.selectAll(".node")
        .data(treeData.descendants())
        .enter().append("g")
        .attr("class", "node")
        .attr("transform", (d: any) => `translate(${d.y},${d.x})`);

      node.append("circle")
        .attr("r", (d: any) => d.data.isVirtual ? 30 : 25)
        .attr("fill", (d: any) => d.data.isVirtual ? "#4f46e5" : "#fff")
        .attr("stroke", "#4f46e5")
        .attr("stroke-width", "2px")
        .style("filter", "drop-shadow(0 4px 6px rgb(0 0 0 / 0.05))");

      // Employee Names
      node.append("text")
        .attr("dy", ".35em")
        .attr("x", (d: any) => d.children ? -35 : 35)
        .attr("text-anchor", (d: any) => d.children ? "end" : "start")
        .attr("font-size", "14px")
        .attr("font-weight", "700")
        .attr("fill", (d: any) => d.data.isVirtual ? "#4f46e5" : "#1e293b")
        .text((d: any) => d.data.name);

      // Roles
      node.append("text")
        .attr("dy", "1.75em")
        .attr("x", (d: any) => d.children ? -35 : 35)
        .attr("text-anchor", (d: any) => d.children ? "end" : "start")
        .attr("font-size", "11px")
        .attr("font-weight", "500")
        .attr("fill", "#94a3b8")
        .text((d: any) => d.data.role);

    } catch (err) {
      console.error("D3 Hierarchy Error:", err);
      // Fallback simple message in SVG if data is circular or broken
      svg.append("text")
        .attr("x", width / 2)
        .attr("y", height / 2)
        .attr("text-anchor", "middle")
        .attr("fill", "#ef4444")
        .text("Hierarchy data error. Check for circular reporting structures.");
    }

  }, [employees]);

  return (
    <div className="bg-white p-8 rounded-3xl border border-slate-100 overflow-auto shadow-sm min-h-[600px]">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Organization Mind Map</h2>
          <p className="text-sm text-slate-500">Visualize teams and reporting lines across the company.</p>
        </div>
        <div className="flex gap-4 text-xs font-semibold">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-indigo-600"></div>
            <span>Managers</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full border border-indigo-600"></div>
            <span>Staff</span>
          </div>
        </div>
      </div>
      <div className="min-w-[900px]">
        <svg ref={svgRef} className="w-full h-auto"></svg>
      </div>
    </div>
  );
};

export default OrgMindMap;

element dictionary {
	element [lhsmodule] {
		element fields {
			element [relationname]-[relationleftside] {
				attribute name { [relationname]-[relationleftside] }
				attribute type { "link" }
				attribute relationship { "[relationname]" }
				attribute side { "left" }
				attribute link-type { "[relationleftside]" }
			}
			element [lhsmodulekey]_id {
				attribute type { "relate" }
				attribute link { [relationname]-[relationleftside] }
			}
			element [lhsmodulekey] {
				attribute type { "name" }
			}
			element [lhsmodulename]_name {
				attribute type { "name" }
				attribute type { "relate" }
			}
		}
	}
}

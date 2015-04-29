<?php 
Class ACF_Parser {
	private $opts = array();
	private $acf_fields = array();
	function ACF_Parser($sections, $options) {
		$options = array_merge(array(
			"post_type" => false,
			"template" => false,
			"options_page" => false,
		), $options);

		$this->opts["meta_boxes"] = $sections;
		$this->opts = array_merge($this->opts, $options);

		$this->acf_fields = $this->parse_meta_boxes_for_acf();
	}

	function get_parsed() {
		return $this->acf_fields;
	}

	function parse_meta_boxes_for_acf() {
		$boxes = array();
		$defaults = array(
			"title" => "Meta Box",
			"fields" => array(),
		);

		$boxSlug = "";

		$display_condition = array(array());
		if($this->opts["post_type"] !== false && is_string($this->opts["post_type"])) {
			$display_condition[0][] = array(
				'param' => 'post_type',
				'operator' => '==',
				'value' => $this->opts["post_type"],
			);
			$boxSlug .= " ".$this->opts["post_type"];
		}
		if($this->opts["template"] !== false && is_string($this->opts["template"])) {
			$display_condition[0][] = array(
				'param' => 'page_template',
				'operator' => '==',
				'value' => $this->opts["template"],
			);
			$boxSlug .= " ".$this->opts["template"];
		}
		if($this->opts["options_page"] !== false && is_string($this->opts["options_page"])) {
			$display_condition[0][] = array(
				'param' => 'options_page',
				'operator' => '==',
				'value' => $this->opts["options_page"],
			);
			$boxSlug .= " ".$this->opts["options_page"];
		}

		foreach($display_condition as $group_no => $conds){
			foreach($conds as $order_no => $cond) {
				$display_condition[$group_no][$order_no] = array_merge($display_condition[$group_no][$order_no], array(
					"order_no" => $order_no,
					"group_no" => $group_no,
				));
			}
		}

		$boxSlug = sanitize_title( trim($boxSlug) );

		foreach($this->opts["meta_boxes"] as $box_id => $box){
			$box = array_merge($defaults, $box);

			$thisBoxId = $boxSlug."_".$box_id;

			$metaData = array(
				'id' => $thisBoxId,
				'title' => $box["title"],
				'fields' => $this->parse_fields_recursive($box["fields"], "field_".$thisBoxId),
				'location' => $display_condition,
				'options' => array(
					'position' => "normal",
					'layout' => 'default',
					'hide_on_screen' => array(),
					'label_placement' => 'left',
				),
			);

			$metaData["options"] = array_merge($metaData["options"], array_intersect_key($box, $metaData["options"]));

			$boxes[] = $metaData;
		}
		return $boxes;
	}
	private function parse_fields_recursive($orig_fields, $path) {
		$fields = array();
		foreach($orig_fields as $meta_key => $field) {

			$thisFieldKey = $path."_".$meta_key;
			$newField = array(
				'key' => $thisFieldKey,
				'label' => $field["name"],
				'name' => $meta_key,
				'type' => $field["type"],
			);

			unset($field["name"]);
			unset($field["type"]);

			$addAfterFields = array();

			$defaults = array();
			switch ($newField["type"]) {
				case 'text':
					$defaults = array(
						'default_value' => '',
						'placeholder' => '',
						'prepend' => '',
						'append' => '',
						'formatting' => 'html',
						'maxlength' => '',
					);
					break;
				
				case "textarea":
				case "paragraph":
					$newField["type"] = "textarea";
					$defaults = array(
						'default_value' => '',
						'placeholder' => '',
						'maxlength' => '',
						'rows' => '',
						'formatting' => 'br',
					);
					break;

				case "wysiwyg":
					$defaults = array(
						'default_value' => '',
						'toolbar' => 'full',
						'media_upload' => 'yes',
					);
					break;

				case "image":
					$defaults = array(
						'return_format' => 'array',
						'preview_size' => 'thumbnail',
						'library' => 'all',
					);
					break;

				case "file":
					$defaults = array(
						'save_format' => 'object',
						'library' => 'all',
					);
					break;

				case "post_list":
				case "post_object":
					$field["type"] = "post_object";
					$defaults = array(
						'post_type' => array('all'),
						'taxonomy' => array('all'),
						'allow_null' => 0,
						'multiple' => 0,
					);
					if(!empty($field["post_type"]) && !is_array($field["post_type"])){
						$defaults["post_type"] = array($field["post_type"]);
						unset($field["post_type"]);
					}
					break;

				case "user":
				case "user_list":
					$field["type"] = "user";
					$defaults = array(
						'role' => array (
							0 => 'all',
						),
						'field_type' => 'select',
						'allow_null' => 0,
					);
					break;

				case "select":
					$defaults = array(
						'choices' => array(),
						'default_value' => '',
						'allow_null' => 0,
						'multiple' => 0,
					);
					break;

				case "true_false":
				case "switch":
					$field["type"] = "true_false";
					$defaults = array(
						'message' => '',
						'default_value' => 0,
					);
					break;

				case "color_picker":
					$defaults = array(
						'default_value' => '',
					);
					break;

				case "repeater":
					$field["sub_fields"] = $this->parse_fields_recursive($field["fields"], $thisFieldKey);
					unset($field["fields"]);
					$defaults = array(
						'layout' => 'row',
						'button_label' => 'Add Row',
					);
					break;

				case "tab":
					$addAfterFields = $this->parse_fields_recursive($field["fields"], $thisFieldKey);
					unset($field["fields"]);
					$field["name"] = "";
					$defaults = array(
						'placement' => 'left',
					);
					break;

				default:
					# code...
					break;
			}

			$newField = array_merge($newField, $defaults);
			$newField = array_merge($newField, $field);
			
			$fields[] = $newField;

			if(!empty($addAfterFields)) {
				foreach($addAfterFields as $_field) {
					$fields[] = $_field;
				}
			}
		}
		return $fields;
	}
}